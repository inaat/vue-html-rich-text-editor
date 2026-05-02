<script setup lang="ts">
import { ref } from 'vue'
import { DocxEditor } from '../src'
import type { MergeFieldCategory } from '../src'

const html = ref('<p>Type or paste your content here!</p>')
const saving = ref(false)

async function saveToDatabase() {
  console.log('Saving to database…')
  if (saving.value) return
  saving.value = true
  try {
    await fetch('http://localhost:3001/documentssave/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: html.value }),
    })
  } finally {
    saving.value = false
  }
}

async function loadFromDatabase() {
  const res = await fetch('http://localhost:3001/documents/1')
  const data = await res.json()
  html.value = data.content
}

const fields: MergeFieldCategory[] = [
  {
    label: 'Author Information',
    fields: [
      { label: 'Title', value: 'author.title' },
      { label: 'Name', value: 'author.name' },
      { label: 'Surname', value: 'author.surname' },
      { label: 'Email', value: 'author.email' },
      { label: 'Photo', value: 'author.photo', type: 'image' },
    ]
  },
  {
    label: 'Customer',
    fields: [
      { label: 'Full Name', value: 'customer.name' },
      { label: 'Email', value: 'customer.email' },
      { label: 'Company', value: 'customer.company' },
      { label: 'Logo', value: 'customer.logo', type: 'image' },
    ]
  },
  {
    label: 'Invoice',
    fields: [
      { label: 'Invoice Number', value: 'invoice.number' },
      { label: 'Invoice Date', value: 'invoice.date' },
      { label: 'Due Date', value: 'invoice.dueDate' },
      { label: 'Total', value: 'invoice.total' },
    ]
  }
]
</script>

<template>
  <div>
    <div style="padding: 8px; display: flex; gap: 8px;">
      <button @click="loadFromDatabase">Load</button>
      <button @click="saveToDatabase" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
    </div>
    <DocxEditor v-model="html" :fields="fields" apiBase="http://localhost:3001"
     lang="ar" 
    
    />
  </div>
</template>
