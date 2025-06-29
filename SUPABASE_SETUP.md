# Supabase Setup Guide

## Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Storage Setup

1. **Create a Storage Bucket:**
   - Go to your Supabase dashboard
   - Navigate to Storage
   - Create a new bucket named `quiz-files`
   - Set it to public or private based on your needs

2. **Storage Policies:**
   - For public access, you can use the default policies
   - For private access, create custom policies

## Installation

Install the Supabase client:

```bash
npm install @supabase/supabase-js
```

## Usage

The function will:
1. Upload PDF to Supabase Storage
2. Extract text from the PDF
3. Save both file URL and extracted text as the answer
4. Provide public URL for file access

## File Structure

Files are stored as:
```
quiz-submissions/
├── quiz_123/
│   ├── quiz_123_question_0_student_456_1234567890.pdf
│   └── quiz_123_question_1_student_456_1234567891.pdf
```

## Error Handling

The function includes:
- File type validation (PDF only)
- File size limits (10MB)
- Upload error handling
- Text extraction error handling 