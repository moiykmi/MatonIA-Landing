#!/bin/bash

# Build script for Vercel deployment
# This script replaces environment variables in env.js

echo "Starting build process..."
echo "SUPABASE_URL: ${SUPABASE_URL:0:20}..."
echo "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ]; then
    echo "Replacing environment variables in env.js..."
    
    # Replace URL first
    sed -i.bak "s|SUPABASE_URL: 'VERCEL_WILL_REPLACE_THIS'|SUPABASE_URL: '$SUPABASE_URL'|g" env.js
    
    # Replace KEY second  
    sed -i.bak "s|SUPABASE_ANON_KEY: 'VERCEL_WILL_REPLACE_THIS'|SUPABASE_ANON_KEY: '$SUPABASE_ANON_KEY'|g" env.js
    
    echo "Environment variables replaced successfully"
    echo "Final env.js content:"
    cat env.js
else
    echo "Warning: SUPABASE_URL or SUPABASE_ANON_KEY not found in environment"
fi

echo "Build completed"