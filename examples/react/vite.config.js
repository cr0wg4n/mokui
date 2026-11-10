import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { mokui } from 'mokui/vite'

export default defineConfig({ plugins: [mokui(), react()] })
