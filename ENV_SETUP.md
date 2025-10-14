# Environment Variables Setup

## Create `.env` File

**IMPORTANT:** You need to manually create a `.env` file in the root of your project.

### Step 1: Create the file

In the root directory (where `package.json` is), create a file named `.env`

### Step 2: Add these variables

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Transport & Communication Workers Federation
VITE_DEFAULT_LANGUAGE=en
```

### Step 3: Restart the dev server

After creating the `.env` file, restart your dev server:

```bash
# Stop the server (Ctrl + C)
# Then start again
npm run dev
```

## Environment Files Structure

Your project should have these environment files:

```
Transport-Federation-UI/
├── .env                    # Local development (create this manually)
├── .env.example           # Template (already exists)
└── .env.production        # Production (create when deploying)
```

## How to Create the `.env` File

### Option 1: Using Command Line (Recommended)

**Windows (PowerShell):**
```powershell
@"
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Transport & Communication Workers Federation
VITE_DEFAULT_LANGUAGE=en
"@ | Out-File -FilePath .env -Encoding UTF8
```

**Windows (Command Prompt):**
```cmd
(
echo VITE_API_BASE_URL=http://localhost:3000
echo VITE_APP_NAME=Transport ^& Communication Workers Federation
echo VITE_DEFAULT_LANGUAGE=en
) > .env
```

**Mac/Linux:**
```bash
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Transport & Communication Workers Federation
VITE_DEFAULT_LANGUAGE=en
EOF
```

### Option 2: Using VS Code

1. In VS Code, click on the root folder
2. Right-click → "New File"
3. Name it `.env`
4. Copy and paste:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Transport & Communication Workers Federation
VITE_DEFAULT_LANGUAGE=en
```
5. Save the file

### Option 3: Copy from Example

```bash
cp .env.example .env
```

Then edit the values if needed.

## Verify It's Working

After creating the `.env` file:

1. Restart your dev server
2. Open the browser console
3. The environment variables should be accessible via `import.meta.env.VITE_*`

## For Production

When deploying to production, create a `.env.production` file:

```env
VITE_API_BASE_URL=https://api.yourproduction.com
VITE_APP_NAME=Transport & Communication Workers Federation
VITE_DEFAULT_LANGUAGE=en
```

Or set these variables in your hosting platform's environment settings (Vercel, Netlify, etc.).

## ⚠️ Important Notes

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Always prefix Vite env vars with `VITE_`** - Only these are exposed to the client
3. **Restart dev server** after changing `.env` files
4. **TypeScript support** is provided by `src/vite-env.d.ts`

## Troubleshooting

### Variables showing as `undefined`

1. Make sure you created the `.env` file in the **root** directory
2. Ensure variable names start with `VITE_`
3. Restart your dev server
4. Clear browser cache

### TypeScript errors on `import.meta.env`

Make sure `src/vite-env.d.ts` exists (already created in your project).

