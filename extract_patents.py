import docx
import os

def extract_docx_text(docx_path, output_path):
    doc = docx.Document(docx_path)
    full_text = []
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if text:
            full_text.append(f"[{i}] {text}")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(full_text))
    print(f"Extracted {len(full_text)} paragraphs from {docx_path} to {output_path}")

files = [
    (r"D:\龙虾工作站\专利相关业务资料\业务资料\专利奖文件\CN101062433A.docx", "patent1.txt"),
    (r"D:\龙虾工作站\专利相关业务资料\业务资料\专利奖文件\CN101172161A.docx", "patent2.txt"),
    (r"D:\龙虾工作站\专利相关业务资料\业务资料\专利奖文件\CN101252025A.docx", "patent3.txt"),
]

for docx_path, txt_name in files:
    output_path = os.path.join(r"D:\程序开发\IPClaw-v3-source\IPClaw-v3", txt_name)
    extract_docx_text(docx_path, output_path)
