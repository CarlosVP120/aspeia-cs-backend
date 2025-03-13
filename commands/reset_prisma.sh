#!/bin/bash

rm -rf prisma/migrations/*
npx prisma migrate dev --name init
npx prisma migrate reset --force
npx prisma db seed