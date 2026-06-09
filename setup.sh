#!/bin/bash

# Install dependencies (also runs prisma generate via postinstall)
npm install

# Apply database migrations
npx prisma migrate deploy

# Seed the database with initial data
npx prisma db seed

# Start the development server
npm run dev
