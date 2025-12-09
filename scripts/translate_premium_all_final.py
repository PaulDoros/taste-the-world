
import os

directory = r'e:\EXPO Training\taste-the-world\constants\translations'

translations = {
    'fr': {
        'premium_benefit_countries': "Débloquez TOUS les 195+ pays y compris l'Italie, la France, le Japon et plus !",
        'premium_benefit_ai': 'Chef IA et Chef de Voyage illimités',
        'premium_benefit_planner': 'Planificateur de repas intelligent (Hebdo & Bébé)',
        'premium_benefit_recipes': 'Recettes illimitées de chaque pays',
        'premium_benefit_filters': 'Filtres avancés (végétarien, végétalien, difficulté)',
        'premium_benefit_favorites': 'Sauvegardez des recettes favorites en illimité',
        'premium_benefit_shopping': 'Listes de courses intelligentes avec catégories',
        'premium_benefit_nutri': 'Informations nutritionnelles',
        'premium_benefit_offline': 'Mode hors ligne - téléchargez des recettes',
        'premium_benefit_ads': 'Expérience sans publicité',
        'premium_benefit_support': 'Support client prioritaire',
    },
    'de': {
        'premium_benefit_countries': 'Schalte ALLE 195+ Länder frei, inklusive Italien, Frankreich, Japan & mehr!',
        'premium_benefit_ai': 'Unbegrenzte KI-Chef & Reise-Chef Nutzung',
        'premium_benefit_planner': 'Smarter Wochen- & Baby-Essensplaner',
        'premium_benefit_recipes': 'Unbegrenzte Rezepte aus jedem Land',
        'premium_benefit_filters': 'Erweiterte Filter (vegetariisch, vegan, Schwierigkeit)',
        'premium_benefit_favorites': 'Speichere unbegrenzt Lieblingsrezepte',
        'premium_benefit_shopping': 'Smarte Einkaufslisten mit Kategorien',
        'premium_benefit_nutri': 'Nährwertinformationen',
        'premium_benefit_offline': 'Offline-Modus - Rezepte herunterladen',
        'premium_benefit_ads': 'Werbefreie Erfahrung',
        'premium_benefit_support': 'Bevorzugter Kundensupport',
    },
    'it': {
        'premium_benefit_countries': 'Sblocca TUTTI i 195+ paesi inclusi Italia, Francia, Giappone e altri!',
        'premium_benefit_ai': 'Chef AI e Travel Chef illimitati',
        'premium_benefit_planner': 'Pianificatore pasti settimanale e per bambini intelligente',
        'premium_benefit_recipes': 'Ricette illimitate da ogni paese',
        'premium_benefit_filters': 'Filtri avanzati (vegetariano, vegano, difficoltà)',
        'premium_benefit_favorites': 'Salva ricette preferite illimitate',
        'premium_benefit_shopping': 'Liste della spesa intelligenti con categorie',
        'premium_benefit_nutri': 'Informazioni nutrizionali',
        'premium_benefit_offline': 'Modalità offline - scarica ricette',
        'premium_benefit_ads': 'Esperienza senza pubblicità',
        'premium_benefit_support': 'Supporto clienti prioritario',
    },
    'pt': {
        'premium_benefit_countries': 'Desbloqueie TODOS os 195+ países, incluindo Itália, França, Japão e mais!',
        'premium_benefit_ai': 'Chef IA e Chef de Viagem ilimitados',
        'premium_benefit_planner': 'Planejador de refeições inteligente (Semanal e Bebês)',
        'premium_benefit_recipes': 'Receitas ilimitadas de todos os países',
        'premium_benefit_filters': 'Filtros avançados (vegetariano, vegano, dificuldade)',
        'premium_benefit_favorites': 'Salve receitas favoritas ilimitadas',
        'premium_benefit_shopping': 'Listas de compras inteligentes com categorias',
        'premium_benefit_nutri': 'Informações nutricionais',
        'premium_benefit_offline': 'Modo offline - baixar receitas',
        'premium_benefit_ads': 'Experiência sem anúncios',
        'premium_benefit_support': 'Suporte ao cliente prioritário',
    },
    'zh': {
        'premium_benefit_countries': '解锁所有 195+ 个国家，包括意大利、法国、日本等！',
        'premium_benefit_ai': '无限使用 AI 厨师和旅行厨师',
        'premium_benefit_planner': '智能每周及婴儿膳食计划',
        'premium_benefit_recipes': '来自每个国家的无限食谱',
        'premium_benefit_filters': '高级筛选（素食、全素、难度）',
        'premium_benefit_favorites': '保存无限喜爱的食谱',
        'premium_benefit_shopping': '带分类的智能购物清单',
        'premium_benefit_nutri': '营养信息',
        'premium_benefit_offline': '离线模式 - 下载食谱',
        'premium_benefit_ads': '无广告体验',
        'premium_benefit_support': '优先客户支持',
    },
    'ja': {
        'premium_benefit_countries': 'イタリア、フランス、日本など195カ国すべてをアンロック！',
        'premium_benefit_ai': 'AIシェフとトラベルシェフが無制限',
        'premium_benefit_planner': 'スマートな週間＆ベビー食事プランナー',
        'premium_benefit_recipes': 'すべての国のレシピが無制限',
        'premium_benefit_filters': '高度なフィルター（ベジタリアン、ビーガン、難易度）',
        'premium_benefit_favorites': 'お気に入りのレシピを無制限に保存',
        'premium_benefit_shopping': 'カテゴリ付きスマート買い物リスト',
        'premium_benefit_nutri': '栄養情報',
        'premium_benefit_offline': 'オフラインモード - レシピをダウンロード',
        'premium_benefit_ads': '広告なしの体験',
        'premium_benefit_support': '優先カスタマーサポート',
    },
    'ru': {
        'premium_benefit_countries': 'Откройте ВСЕ 195+ стран, включая Италию, Францию, Японию и другие!',
        'premium_benefit_ai': 'Безлимитный ИИ-шеф и Тревел-шеф',
        'premium_benefit_planner': 'Умный планировщик питания (на неделю и для детей)',
        'premium_benefit_recipes': 'Безлимитные рецепты из каждой страны',
        'premium_benefit_filters': 'Расширенные фильтры (вегетарианские, веганские, сложность)',
        'premium_benefit_favorites': 'Сохраняйте безлимитное количество любимых рецептов',
        'premium_benefit_shopping': 'Умные списки покупок с категориями',
        'premium_benefit_nutri': 'Информация о пищевой ценности',
        'premium_benefit_offline': 'Офлайн режим - скачивание рецептов',
        'premium_benefit_ads': 'Без рекламы',
        'premium_benefit_support': 'Приоритетная поддержка',
    },
    'hu': {
        'premium_benefit_countries': 'Oldd fel mind a 195+ országot, beleértve Olaszországot, Franciaországot, Japánt és többit!',
        'premium_benefit_ai': 'Korlátlan AI Séf és Utazó Séf',
        'premium_benefit_planner': 'Okos Heti és Baba Menütervező',
        'premium_benefit_recipes': 'Korlátlan recept minden országból',
        'premium_benefit_filters': 'Speciális szűrők (vegetáriánus, vegán, nehézség)',
        'premium_benefit_favorites': 'Ments el korlátlan kedvenc receptet',
        'premium_benefit_shopping': 'Okos bevásárlólisták kategóriákkal',
        'premium_benefit_nutri': 'Tápérték információk',
        'premium_benefit_offline': 'Offline mód - receptek letöltése',
        'premium_benefit_ads': 'Reklámmentes élmény',
        'premium_benefit_support': 'Kiemelt ügyfélszolgálat',
    },
    'uk': {
        'premium_benefit_countries': 'Відкрийте ВСІ 195+ країн, включаючи Італію, Францію, Японію та інші!',
        'premium_benefit_ai': 'Безлімітний ШІ-шеф та Тревел-шеф',
        'premium_benefit_planner': 'Розумний планувальник харчування (тижневий та дитячий)',
        'premium_benefit_recipes': 'Безлімітні рецепти з кожної країни',
        'premium_benefit_filters': 'Розширені фільтри (вегетаріанські, веганські, складність)',
        'premium_benefit_favorites': 'Зберігайте безлімітну кількість улюблених рецептів',
        'premium_benefit_shopping': 'Розумні списки покупок з категоріями',
        'premium_benefit_nutri': 'Інформація про харчову цінність',
        'premium_benefit_offline': 'Офлайн режим - завантаження рецептів',
        'premium_benefit_ads': 'Без реклами',
        'premium_benefit_support': 'Пріоритетна підтримка',
    },
    'hi': {
        'premium_benefit_countries': 'इटली, फ्रांस, जापान और अन्य सहित सभी 195+ देशों को अनलॉक करें!',
        'premium_benefit_ai': 'असीमित एआई शेफ और ट्रैवल शेफ',
        'premium_benefit_planner': 'स्मार्ट साप्ताहिक और बेबी मील प्लानर',
        'premium_benefit_recipes': 'हर देश से असीमित रेसिपी',
        'premium_benefit_filters': 'उन्नत फिल्टर (शाकाहारी, वीगन, कठिनाई)',
        'premium_benefit_favorites': 'असीमित पसंदीदा रेसिपी सहेजें',
        'premium_benefit_shopping': 'श्रेणियों के साथ स्मार्ट शॉपिंग सूचियां',
        'premium_benefit_nutri': 'पोषण संबंधी जानकारी',
        'premium_benefit_offline': 'ऑफ़लाइन मोड - रेसिपी डाउनलोड करें',
        'premium_benefit_ads': 'विज्ञापन-मुक्त अनुभव',
        'premium_benefit_support': 'प्राथमिकता ग्राहक सहायता',
    },
    'ar': {
        'premium_benefit_countries': 'افتح جميع الدول الـ 195+ بما في ذلك إيطاليا وفرنسا واليابان والمزيد!',
        'premium_benefit_ai': 'طاهي ذكاء اصطناعي وطاهي سفر غير محدود',
        'premium_benefit_planner': 'مخطط وجبات ذكي أسبوعي وللأطفال',
        'premium_benefit_recipes': 'وصفات غير محدودة من كل بلد',
        'premium_benefit_filters': 'فلاتر متقدمة (نباتي، فيجان، الصعوبة)',
        'premium_benefit_favorites': 'حفظ وصفات مفضلة غير محدودة',
        'premium_benefit_shopping': 'قوائم تسوق ذكية مع فئات',
        'premium_benefit_nutri': 'معلومات غذائية',
        'premium_benefit_offline': 'وضع عدم الاتصال - تنزيل الوصفات',
        'premium_benefit_ads': 'تجربة خالية من الإعلانات',
        'premium_benefit_support': 'دعم عملاء ذو أولوية',
    },
    'ko': {
        'premium_benefit_countries': '이탈리아, 프랑스, 일본 등 195개국 이상 모두 잠금 해제!',
        'premium_benefit_ai': '무제한 AI 셰프 & 여행 셰프',
        'premium_benefit_planner': '스마트 주간 & 유아 식단 플래너',
        'premium_benefit_recipes': '모든 국가의 무제한 레시피',
        'premium_benefit_filters': '고급 필터 (채식, 비건, 난이도)',
        'premium_benefit_favorites': '무제한 즐겨찾기 레시피 저장',
        'premium_benefit_shopping': '카테고리가 있는 스마트 쇼핑 목록',
        'premium_benefit_nutri': '영양 정보',
        'premium_benefit_offline': '오프라인 모드 - 레시피 다운로드',
        'premium_benefit_ads': '광고 없는 경험',
        'premium_benefit_support': '우선 고객 지원',
    },
    'tr': {
        'premium_benefit_countries': 'İtalya, Fransa, Japonya ve daha fazlası dahil 195+ ülkenin kilidini aç!',
        'premium_benefit_ai': 'Sınırsız Yapay Zeka Şefi ve Gezi Şefi',
        'premium_benefit_planner': 'Akıllı Haftalık ve Bebek Yemek Planlayıcı',
        'premium_benefit_recipes': 'Her ülkeden sınırsız tarif',
        'premium_benefit_filters': 'Gelişmiş filtreler (vejetaryen, vegan, zorluk)',
        'premium_benefit_favorites': 'Sınırsız favori tarif kaydet',
        'premium_benefit_shopping': 'Kategorili akıllı alışveriş listeleri',
        'premium_benefit_nutri': 'Besin değerleri bilgisi',
        'premium_benefit_offline': 'Çevrimdışı mod - tarifleri indir',
        'premium_benefit_ads': 'Reklamsız deneyim',
        'premium_benefit_support': 'Öncelikli müşteri desteği',
    },
    'id': {
        'premium_benefit_countries': 'Buka SEMUA 195+ negara termasuk Italia, Prancis, Jepang & lainnya!',
        'premium_benefit_ai': 'Koki AI & Koki Perjalanan Tak Terbatas',
        'premium_benefit_planner': 'Perencana Makanan Mingguan & Bayi Cerdas',
        'premium_benefit_recipes': 'Resep tak terbatas dari setiap negara',
        'premium_benefit_filters': 'Filter canggih (vegetarian, vegan, tingkat kesulitan)',
        'premium_benefit_favorites': 'Simpan resep favorit tak terbatas',
        'premium_benefit_shopping': 'Daftar belanja cerdas dengan kategori',
        'premium_benefit_nutri': 'Informasi nutrisi',
        'premium_benefit_offline': 'Mode offline - unduh resep',
        'premium_benefit_ads': 'Pengalaman bebas iklan',
        'premium_benefit_support': 'Dukungan pelanggan prioritas',
    },
}

for lang, keys in translations.items():
    filepath = os.path.join(directory, f"{lang}.ts")
    if os.path.exists(filepath):
        # 1. READ FILE
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 2. CHECK FOR DUPLICATES (Clean up)
        # Check if "  // Premium Benefits" appears more than once
        # The same cleanup logic as before
        parts = content.split("  // Premium Benefits")
        if len(parts) > 2:
            print(f"Cleaning duplicates in {lang}...")
            # Keep parts[0] + "  // Premium Benefits" + parts[1] (cleaned)
            content = parts[0] + "  // Premium Benefits" + parts[1]
            
            # Ensure proper closing
            # Just trim after the last expected key from part[1] or similar
            # A simpler way: Find the LAST closing brace `};` and cut everything after it?
            # Or assume parts[1] is the good block and just needs a closing brace if it was cut.
            
            # Since I know the structure, let's just make sure it ends with }; 
            # and remove any subsequent garbage.
            
            # The "Cleaning" relies on identifying where the valid block ends.
            # In my previous script, I relied on finding the second occurrence start.
            
            first_occurrence = content.find("  // Premium Benefits")
            second_occurrence_in_original = parts[0].count("  // Premium Benefits") 
            # wait, split removes it.
            
            # Let's re-read the file content logic from previous script attempt
            # The previous script used:
            # first = content.find(...)
            # second = content.find(..., first + 1)
            # if second != -1: content = content[:second]...
            
            # Re-implement that logic here for safety
            first_idx = content.find("  // Premium Benefits")
            if first_idx != -1:
                second_idx = content.find("  // Premium Benefits", first_idx + 1)
                if second_idx != -1:
                    content = content[:second_idx].rstrip()
                    if not content.strip().endswith('};'):
                        # Fix closing
                         if content.strip().endswith(','):
                              content = content.rstrip().rstrip(',') + "\n};"
                         elif content.strip().endswith('}'):
                              content = content.rstrip() + ";"
                         else:
                              content += "\n};"
        
        # 3. APPEND OR UPDATE KEYS
        # If the file lacks the keys entirely (e.g. I didn't run update_translations.py on it yet), append them.
        # If it has them (English), update them.
        
        has_keys = 'premium_benefit_countries' in content
        
        updated_content = content
        
        if not has_keys:
             print(f"Appending keys to {lang}...")
             # Prepare the block
             new_block = "\n\n  // Premium Benefits\n"
             for k, v in keys.items():
                 # Handle quotes
                 val = v.replace("'", "\\'") 
                 new_block += f"  {k}: '{val}',\n"
             new_block += "};\n"
             
             # Remove last };
             updated_content = updated_content.rstrip()
             if updated_content.endswith('};'):
                 updated_content = updated_content[:-2]
             
             if not updated_content.strip().endswith(','):
                  updated_content += ","
                  
             updated_content += new_block
             
        else:
             print(f"Updating keys in {lang}...")
             for k, v in keys.items():
                 # Regex replace existing key
                 import re
                 # pattern:   key: '...',
                 # value can be anything.
                 val_escaped = v.replace("'", "\\'")
                 new_line = f"  {k}: '{val_escaped}',"
                 
                 # Regex:   key \s* : \s* ['"] .* ['"] ,?
                 # Be careful with multi-line matches if present.
                 # Assuming single line for now as most represent my previous insertions.
                 
                 pattern = f"{k}\\s*:\\s*['\"].*['\"],?"
                 
                 # Check if it exists with regex
                 if re.search(pattern, updated_content):
                     updated_content = re.sub(pattern, new_line, updated_content)
                 else:
                     # It might be multiline or formatting differs. 
                     # If I can't find it easily, I might skip or brute force append? 
                     # Better to leave it if I can't safely replace.
                     pass

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated_content)

print("Done translating/updating all files.")
