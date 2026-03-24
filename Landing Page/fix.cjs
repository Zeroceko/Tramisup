const fs = require('fs');
let code = fs.readFileSync('src/pages/Index.tsx', 'utf8');
code = '"use client";\n' + code;
code = code.replace(/import \{ useNavigate \} from "react-router-dom";/g, 'import { useRouter } from "next/navigation";');
code = code.replace(/const navigate = useNavigate\(\);/g, 'const router = useRouter();\n  const navigate = (p) => router.push(String(p));');
code = code.replace(/import (.*?) from "@\/assets\/(.*?)";/g, 'const $1 = "/assets/$2";');
fs.writeFileSync('../Tiramisup/app/[locale]/page.tsx', code);
console.log('Fixed page.tsx successfully!');
