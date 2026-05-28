import os
import re

def convert_tsx_to_vue(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if it's already a .vue file or not a React component file
    if filepath.endswith('.vue') or 'export function' not in content:
        return False

    print(f"Migrating {filepath}...")

    # Extract imports
    imports = []
    import_pattern = re.compile(r'^import\s+.*?;', re.MULTILINE | re.DOTALL)
    for match in import_pattern.finditer(content):
        imports.append(match.group(0))
        
    imports_str = "\n".join(imports)
    imports_str = imports_str.replace('react-router', 'vue-router')
    imports_str = imports_str.replace('lucide-react', 'lucide-vue-next')
    imports_str = imports_str.replace('./ui/', '@/components/ui/')
    imports_str = imports_str.replace('../ui/', '@/components/ui/')
    imports_str = imports_str.replace('../../ui/', '@/components/ui/')
    imports_str = imports_str.replace('react', 'vue')
    
    # Extract the main component function
    comp_pattern = re.compile(r'export\s+(?:default\s+)?function\s+(\w+)\s*\([^)]*\)\s*{(.*)}', re.DOTALL)
    comp_match = comp_pattern.search(content)
    
    if not comp_match:
        return False
        
    comp_name = comp_match.group(1)
    comp_body = comp_match.group(2)
    
    # Extract return statement (the template)
    return_pattern = re.compile(r'return\s*\(\s*(<.*>)\s*\);?\s*$', re.DOTALL)
    return_match = return_pattern.search(comp_body)
    
    if return_match:
        template = return_match.group(1)
        script_body = comp_body[:return_match.start()]
    else:
        # Fallback for return <div...
        return_pattern2 = re.compile(r'return\s+(<.*);?\s*$', re.DOTALL)
        return_match2 = return_pattern2.search(comp_body)
        if return_match2:
            template = return_match2.group(1)
            script_body = comp_body[:return_match2.start()]
        else:
            template = "<!-- Auto-extraction of template failed. Please migrate manually. -->\n<div>" + comp_name + " Component</div>"
            script_body = comp_body

    # Fix basic JSX to Vue template differences
    template = template.replace('className=', 'class=')
    template = template.replace('htmlFor=', 'for=')
    template = re.sub(r'<Link\s+to="([^"]+)">', r'<router-link to="\1">', template)
    template = template.replace('</Link>', '</router-link>')
    
    # Fix curly braces for class names with logic
    template = re.sub(r'class=\{`([^`]+)`\}', r':class="`\1`"', template)
    
    # Very basic state conversion (useState -> ref)
    script_body = re.sub(r'const\s+\[(\w+),\s*set\w+\]\s*=\s*useState(\<.*?\>)?\((.*?)\);', r'const \1 = ref(\3);', script_body)
    
    if 'ref(' in script_body and 'import { ref }' not in imports_str:
        imports_str = "import { ref } from 'vue';\n" + imports_str

    vue_content = f"""<script setup lang="ts">
{imports_str}

{script_body.strip()}
</script>

<template>
{template}
</template>
"""
    
    new_filepath = filepath.replace('.tsx', '.vue')
    with open(new_filepath, 'w', encoding='utf-8') as f:
        f.write(vue_content)
        
    # We leave the original .tsx file for reference, user can delete it later
    return True

def process_dir(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') and file not in ['Login.tsx', 'RoleSelector.tsx', 'main.tsx', 'App.tsx']:
                filepath = os.path.join(root, file)
                try:
                    success = convert_tsx_to_vue(filepath)
                    if success:
                        print(f"Converted {filepath}")
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

process_dir('src/app/components')
