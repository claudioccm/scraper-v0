<template>
  <ccm-section>
    <form class="stack" @submit.prevent="submitContact">
      <field-group>
        <label for="name">Name</label>
        <input id="name" v-model="contact.name" type="text" required autocomplete="name" />
      </field-group>
      <field-group>
        <label for="email">Email</label>
        <input id="email" v-model="contact.email" type="email" required autocomplete="email" />
      </field-group>
      <field-group>
        <label for="message">Message</label>
        <textarea id="message" v-model="contact.message" required rows="5"></textarea>
      </field-group>
      <button type="submit" :disabled="submitting">{{ submitting ? 'Sending…' : 'Send' }}</button>
      <p v-if="success">Thanks for reaching out! We'll get back to you soon.</p>
      <p v-if="error">Something went wrong. Please try again.</p>
    </form>
  </ccm-section>
</template>

<script setup>
definePageMeta({
  hero: {
    brow: 'Contact',
    title: 'Contact',
    tagline: 'Get in touch with us',
    size: 'l',
    hideTopbar: false
  }
})

const contact = reactive({
  name: '',
  email: '',
  message: ''
})

const submitting = ref(false)
const success = ref(false)
const error = ref(false)

async function submitContact() {
  if (submitting.value) return
  success.value = false
  error.value = false
  submitting.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: contact
    })
    success.value = true
    contact.name = ''
    contact.email = ''
    contact.message = ''
  } catch (e) {
    error.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>

</style>