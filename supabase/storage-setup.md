# Configurare Supabase Storage

## Bucket-uri necesare

Aplicația SocialPilot necesită **un singur bucket** în Supabase Storage:

### 1. Bucket: `logos`

**Scop**: Stocarea logo-urilor încărcate de utilizatori pentru Brand Kit

**Configurare**:
- **Nume**: `logos`
- **Public**: ✅ **DA** (pentru a permite accesul public la logo-uri)
- **File size limit**: Recomandat 5MB (sau mai mare dacă doriți)
- **Allowed MIME types**: `image/*` (sau specific: `image/png, image/jpeg, image/jpg, image/gif, image/webp, image/svg+xml`)

**Structura fișierelor**:
```
logos/
  └── {user_id}/
      └── {timestamp}.{ext}
```

Exemplu: `logos/123e4567-e89b-12d3-a456-426614174000/1704067200000.png`

## Pași de configurare în Supabase Dashboard

1. **Deschideți Supabase Dashboard** → Proiectul dvs. → **Storage**

2. **Creați bucket-ul**:
   - Click pe **"New bucket"**
   - Nume: `logos`
   - Bifați **"Public bucket"** (pentru acces public)
   - Click **"Create bucket"**

3. **Configurați policies (RLS)**:

   Pentru bucket-ul `logos`, adăugați următoarele policies în **Storage Policies**:

   **IMPORTANT**: Ștergeți toate policies-urile existente pentru bucket-ul `logos` înainte de a adăuga acestea noi.

   **Policy 1: Allow authenticated users to upload their own logos**
   ```sql
   CREATE POLICY "Users can upload own logos"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'logos' AND
     (string_to_array(name, '/'))[1] = auth.uid()::text
   );
   ```

   **Policy 2: Allow authenticated users to update their own logos**
   ```sql
   CREATE POLICY "Users can update own logos"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (
     bucket_id = 'logos' AND
     (string_to_array(name, '/'))[1] = auth.uid()::text
   )
   WITH CHECK (
     bucket_id = 'logos' AND
     (string_to_array(name, '/'))[1] = auth.uid()::text
   );
   ```

   **Policy 3: Allow public read access to logos**
   ```sql
   CREATE POLICY "Public read access for logos"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'logos');
   ```

   **Policy 4: Allow authenticated users to delete their own logos**
   ```sql
   CREATE POLICY "Users can delete own logos"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'logos' AND
     (string_to_array(name, '/'))[1] = auth.uid()::text
   );
   ```

## Verificare

După configurare, verificați că:
- ✅ Bucket-ul `logos` există și este public
- ✅ Policies-urile RLS sunt active
- ✅ Utilizatorii autentificați pot încărca logo-uri
- ✅ Logo-urile sunt accesibile public (pentru afișare în aplicație)

## Note importante

- Logo-urile sunt organizate în foldere după `user_id` pentru izolare și securitate
- Fiecare utilizator poate accesa doar propriile logo-uri (prin policies RLS)
- Logo-urile sunt publice pentru a putea fi afișate în aplicație fără autentificare
- Dacă doriți să restricționați accesul public, puteți modifica Policy 3 să permită doar utilizatorilor autentificați
