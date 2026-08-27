const fs = require('fs');
let code = fs.readFileSync('src/routes/__root.tsx', 'utf8');

if (!code.includes('AuthProvider')) {
    code = code.replace(
        'import { useEffect, type ReactNode } from "react";',
        'import { useEffect, type ReactNode } from "react";\nimport { AuthProvider } from "../lib/auth-context";'
    );
    
    code = code.replace(
        '<Outlet />',
        '<AuthProvider><Outlet /></AuthProvider>'
    );
    
    fs.writeFileSync('src/routes/__root.tsx', code, 'utf8');
}
