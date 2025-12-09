
import os

directory = r'e:\EXPO Training\taste-the-world\constants\translations'
new_keys = """
  // Premium Benefits
  premium_benefit_countries: 'Unlock ALL 195+ countries including Italy, France, Japan & more!',
  premium_benefit_ai: 'Unlimited AI Chef & Travel Chef',
  premium_benefit_planner: 'Smart Weekly & Baby Meal Planner',
  premium_benefit_recipes: 'Unlimited recipes from every country',

  premium_benefit_favorites: 'Save unlimited favorite recipes',
  premium_benefit_shopping: 'Smart shopping lists with categories',
  premium_benefit_nutri: 'Nutritional information',
  premium_benefit_offline: 'Offline mode - download recipes',
  premium_benefit_ads: 'Ad-free experience',
  premium_benefit_support: 'Priority customer support',
};
"""

for filename in os.listdir(directory):
    if filename.endswith(".ts") and filename != "en.ts":
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove the last closing brace and any trailing whitespace/newlines before it
        content = content.rstrip()
        if content.endswith('};'):
            content = content[:-2]
        
        # Add a comma if it's missing on the last property (simple check)
        content = content.rstrip()
        if not content.endswith(',') and not content.endswith('{'):
             content += ","

        # Append new keys
        new_content = content + "\n" + new_keys
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
            print(f"Updated {filename}")
