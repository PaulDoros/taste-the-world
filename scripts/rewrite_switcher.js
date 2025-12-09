const fs = require('fs');
const path = require('path');

const plannerPath = path.join(__dirname, '../app/(tabs)/planner.tsx');
let content = fs.readFileSync(plannerPath, 'utf8');

// Regex to find the entire AnimatedModeSwitcher component definition
// Matches from `const AnimatedModeSwitcher` down to the closing brace/semicolon
const regex = /const AnimatedModeSwitcher\s*=\s*\(\{[\s\S]*?\}\s*;\s*\n?$/;

const newComponent = `const AnimatedModeSwitcher = ({ mode, setMode, colors }: any) => {
  const [layoutWidth, setLayoutWidth] = useState(0);

  // Animated styles defined at component top level
  // Using direct state in useAnimatedStyle as requested
  const sliderStyle = useAnimatedStyle(() => {
    // If layout hasn't been measured yet, avoid jumping
    if (layoutWidth === 0) return {};
    
    return {
      transform: [
        {
          translateX: withSpring(mode === 'standard' ? 0 : (layoutWidth * 0.5), {
            damping: 15,
            stiffness: 150,
            mass: 0.8,
          }),
        },
      ],
    };
  });

  const standardTextStyle = useAnimatedStyle(() => ({
    color: withSpring(mode === 'standard' ? '#ffffff' : colors.text),
  }));

  const babyTextStyle = useAnimatedStyle(() => ({
    color: withSpring(mode === 'baby' ? '#ffffff' : colors.text),
  }));

  return (
    <View
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      style={{
        backgroundColor: colors.card,
        flexDirection: 'row',
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        height: 54,
        position: 'relative',
      }}
    >
      {/* Animated Slider Background */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 4,
            left: 4,
            bottom: 4,
            width: '50%',
            borderRadius: 12,
            backgroundColor: mode === 'baby' ? '#FFB6C1' : colors.tint,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          },
          sliderStyle,
        ]}
      />

      <Pressable
        onPress={() => {
          haptics.selection();
          setMode('standard');
        }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Animated.Text style={[{ fontWeight: '700' }, standardTextStyle]}>
          Standard
        </Animated.Text>
      </Pressable>
      <Pressable
        onPress={() => {
          haptics.selection();
          setMode('baby');
        }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Animated.Text style={[{ fontWeight: '700' }, babyTextStyle]}>
          Baby Food
        </Animated.Text>
      </Pressable>
    </View>
  );
};`;

// We need to match loosely because regex multiline is tricky with JS code structure
// Instead, let's find the start index and replace until the end of the file if it's the last component
const startMarker =
  'const AnimatedModeSwitcher = ({ mode, setMode, modeAnim, colors }: any) => {';
const startIndex = content.indexOf(startMarker);

if (startIndex !== -1) {
  // Replace from start marker to end of file (assuming it's at the bottom)
  // Actually, safer to just replace valid block if we can specific end.
  // Given the previous view_file, it IS at the bottom.
  // Let's replace everything from startMarker to the end.
  const before = content.substring(0, startIndex);
  const newContent = before + newComponent + '\n';
  fs.writeFileSync(plannerPath, newContent);
  console.log('Successfully replaced AnimatedModeSwitcher!');
} else {
  // Try the other signature if I modified it slightly in previous attempts without viewing
  const altStartMarker = 'const AnimatedModeSwitcher =';
  const lastIndex = content.lastIndexOf(altStartMarker);
  if (lastIndex !== -1) {
    const before = content.substring(0, lastIndex);
    const newContent = before + newComponent + '\n';
    fs.writeFileSync(plannerPath, newContent);
    console.log('Successfully replaced AnimatedModeSwitcher (alt match)!');
  } else {
    console.error('Could not find AnimatedModeSwitcher definition.');
    process.exit(1);
  }
}
