import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  TextArea,
  Card,
  Spinner,
  Label,
} from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import { Id } from '@/convex/_generated/dataModel';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateRecipeScreen() {
  const { user, token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, language } = useLanguage();
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipeId = params.recipeId as Id<'myRecipes'> | undefined;

  // Load existing recipe if editing
  const existingRecipe = useQuery(
    api.myRecipes.get,
    recipeId ? { id: recipeId } : 'skip'
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<
    { name: string; measure: string }[]
  >([{ name: '', measure: '' }]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scannedImageUri, setScannedImageUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Storage & AI
  const generateUploadUrl = useMutation(api.myRecipes.generateUploadUrl);
  const extractRecipe = useAction(api.ai.extractRecipeFromImage);
  const createRecipe = useMutation(api.myRecipes.create);
  const updateRecipe = useMutation(api.myRecipes.update);

  // Hydrate form if editing
  useEffect(() => {
    if (existingRecipe) {
      setTitle(existingRecipe.title);
      setDescription(existingRecipe.description || '');
      setIngredients(existingRecipe.ingredients);
      setInstructions(existingRecipe.instructions);
      setImageUri(existingRecipe.imageUrl || null);
      // We assume existingRecipe might return originalImageUrl if we updated the query properly in previous step?
      // Let's check type definition logic. It needs to be cast or we rely on loose typing.
      if ((existingRecipe as any).originalImageUrl) {
        setScannedImageUri((existingRecipe as any).originalImageUrl);
      }
    }
  }, [existingRecipe]);

  const pickImage = async (
    mode: 'camera' | 'library',
    purpose: 'header' | 'scan'
  ) => {
    let result;
    if (mode === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        alert('Camera permission required');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true, // Maybe false for scan? Actually true is fine for cropping text
        quality: 0.7,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.7,
      });
    }

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      if (purpose === 'scan') {
        // Explicit scan intent
        handleScan(uri);
      } else {
        // Explicit header intent
        setImageUri(uri);
      }
    }
  };

  const handleScan = async (uri: string) => {
    if (!uri) return;
    setScannedImageUri(uri); // Show it as scanned image
    setIsScanning(true);
    try {
      // 1. Describe upload URL
      const uploadUrl = await generateUploadUrl();
      // 2. Upload
      const response = await fetch(uri);
      const blob = await response.blob();
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': blob.type },
        body: blob,
      });
      const { storageId } = await result.json();

      // 3. Extract - Pass language code
      const jsonString = await extractRecipe({
        imageStorageId: storageId,
        language: language,
      });
      const data = JSON.parse(jsonString);

      // 4. Populate Form
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.ingredients) setIngredients(data.ingredients);
      if (data.instructions) setInstructions(data.instructions);

      alert('Recipe Scanned Successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to scan recipe. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    if (!user) return;

    setIsSaving(true);
    try {
      let storageId = undefined;
      let originalStorageId = undefined;

      // Upload Header image if changed and new
      if (imageUri && !imageUri.startsWith('http')) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': blob.type },
          body: blob,
        });
        const json = await result.json();
        storageId = json.storageId;
      }

      // Upload Scanned image if changed and new (and we have one)
      if (scannedImageUri && !scannedImageUri.startsWith('http')) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(scannedImageUri);
        const blob = await response.blob();
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': blob.type },
          body: blob,
        });
        const json = await result.json();
        originalStorageId = json.storageId;
      }

      if (recipeId) {
        await updateRecipe({
          id: recipeId,
          title,
          description,
          ingredients,
          instructions,
          imageStorageId: storageId, // only updates if new image
          originalImageStorageId: originalStorageId,
        });
        alert('Recipe Updated!');
      } else {
        await createRecipe({
          userId: user._id as Id<'users'>,
          title,
          description,
          ingredients,
          instructions,
          imageStorageId: storageId,
          originalImageStorageId: originalStorageId,
          source: scannedImageUri ? 'scan' : 'manual',
        });
        alert('Recipe Created!');
      }
      router.back();
    } catch (e) {
      console.error(e);
      alert('Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  };

  const updateIngredient = (
    index: number,
    field: 'name' | 'measure',
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () =>
    setIngredients([...ingredients, { name: '', measure: '' }]);

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const addInstruction = () => setInstructions([...instructions, '']);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      <XStack
        padding="$4"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <Button
          chromeless
          icon={<FontAwesome5 name="times" size={20} color={colors.text} />}
          onPress={() => router.back()}
        />
        <Text fontSize="$4" fontWeight="bold" color={colors.text}>
          {recipeId ? 'Edit Recipe' : 'New Recipe'}
        </Text>
        <Button
          size="$3"
          theme="active"
          backgroundColor={colors.tint}
          color="white"
          disabled={isSaving}
          onPress={handleSave}
          icon={isSaving ? <Spinner color="white" /> : undefined}
        >
          Save
        </Button>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Image Section */}
        <YStack alignItems="center" marginBottom="$4" gap="$3">
          {/* Header Image Slot */}
          <Label color={colors.text} alignSelf="flex-start" marginLeft="$2">
            Cover Photo (Finished Dish)
          </Label>
          <Card
            width="100%"
            height={200}
            bordered
            overflow="hidden"
            backgroundColor="$gray4"
            justifyContent="center"
            alignItems="center"
            onPress={() => pickImage('camera', 'header')} // Default action?
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <YStack alignItems="center" gap="$2">
                <FontAwesome5
                  name="camera"
                  size={32}
                  color={colors.text}
                  opacity={0.5}
                />
                <Text color={colors.text} opacity={0.5}>
                  Add Cover Photo
                </Text>
              </YStack>
            )}
            {/* Overlay Buttons */}
            <XStack position="absolute" bottom="$2" right="$2" gap="$2">
              <Button
                size="$2"
                theme="active"
                icon={<FontAwesome5 name="camera" />}
                onPress={() => pickImage('camera', 'header')}
              ></Button>
              <Button
                size="$2"
                icon={<FontAwesome5 name="image" />}
                onPress={() => pickImage('library', 'header')}
              ></Button>
            </XStack>
          </Card>

          {/* Original Scan Slot (if exists) */}
          {(scannedImageUri || isScanning) && (
            <YStack width="100%" gap="$2">
              <Label color={colors.text} alignSelf="flex-start" marginLeft="$2">
                Original Recipe Scan
              </Label>
              <Card
                width="100%"
                height={120}
                bordered
                overflow="hidden"
                backgroundColor="$gray3"
                justifyContent="center"
                alignItems="center"
              >
                {scannedImageUri ? (
                  <Image
                    source={{ uri: scannedImageUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                ) : (
                  <Spinner color={colors.tint} />
                )}
              </Card>
            </YStack>
          )}

          {/* Scan Action only shown if we assume they want to add a scan */}
          {!scannedImageUri && !isScanning && (
            <XStack gap="$3">
              <Button
                flex={1}
                icon={<FontAwesome5 name="magic" size={16} />}
                onPress={() => pickImage('camera', 'scan')}
                theme="active"
                backgroundColor="$purple9"
                color="white"
              >
                Scan (Camera)
              </Button>
              <Button
                flex={1}
                icon={<FontAwesome5 name="image" size={16} />}
                onPress={() => pickImage('library', 'scan')}
                theme="active"
                backgroundColor="$purple9"
                color="white"
              >
                Scan (Gallery)
              </Button>
            </XStack>
          )}

          {isScanning && (
            <XStack
              backgroundColor="$blue5"
              padding="$3"
              borderRadius="$4"
              alignItems="center"
              gap="$3"
            >
              <Spinner color="white" />
              <Text color="white" fontWeight="bold">
                Scanning Recipe with AI...
              </Text>
            </XStack>
          )}
        </YStack>

        {/* Basic Info */}
        <YStack gap="$3" marginBottom="$4">
          <Label color={colors.text}>Title</Label>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Recipe Name"
            backgroundColor={colors.card}
            color={colors.text}
          />

          <Label color={colors.text}>Description</Label>
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description..."
            backgroundColor={colors.card}
            color={colors.text}
            numberOfLines={3}
          />
        </YStack>

        {/* Ingredients */}
        <YStack gap="$2" marginBottom="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Label color={colors.text} fontWeight="bold">
              Ingredients
            </Label>
            <Button
              size="$2"
              chromeless
              icon={<FontAwesome5 name="plus" />}
              onPress={addIngredient}
            />
          </XStack>

          {ingredients.map((ing, i) => (
            <XStack key={i} gap="$2">
              <Input
                flex={2}
                placeholder="Item"
                value={ing.name}
                onChangeText={(t) => updateIngredient(i, 'name', t)}
                backgroundColor={colors.card}
                color={colors.text}
              />
              <Input
                flex={1}
                placeholder="Qty"
                value={ing.measure}
                onChangeText={(t) => updateIngredient(i, 'measure', t)}
                backgroundColor={colors.card}
                color={colors.text}
              />
            </XStack>
          ))}
        </YStack>

        {/* Instructions */}
        <YStack gap="$2" marginBottom="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Label color={colors.text} fontWeight="bold">
              Instructions
            </Label>
            <Button
              size="$2"
              chromeless
              icon={<FontAwesome5 name="plus" />}
              onPress={addInstruction}
            />
          </XStack>

          {instructions.map((inst, i) => (
            <XStack key={i} gap="$2" alignItems="flex-start">
              <Text marginTop="$2" color={colors.text} fontWeight="bold">
                {i + 1}.
              </Text>
              <TextArea
                flex={1}
                placeholder={`Step ${i + 1}`}
                value={inst}
                onChangeText={(t) => updateInstruction(i, t)}
                backgroundColor={colors.card}
                color={colors.text}
                numberOfLines={2}
              />
            </XStack>
          ))}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
