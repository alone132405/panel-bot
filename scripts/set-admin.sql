-- Update user role to ADMIN
-- Replace 'your-email@example.com' with your actual email

UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';

-- Or update all users to ADMIN (if you want everyone to be admin)
-- UPDATE "User" SET role = 'ADMIN';

-- Verify the update
SELECT id, email, name, role FROM "User";
