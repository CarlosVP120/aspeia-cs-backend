#!/bin/bash

rm -rf prisma/migrations/*
npx prisma migrate reset --force && npx prisma migrate dev --name init