'use client';
import ContactForm from "@/components/ContactForm";
import ResponsivePage from "@/components/Page/ResponsivePage";
import Section from "@/components/Page/Section";



export default function ContactPage() {


  return (
    <ResponsivePage>
      <Section>
        <ContactForm />
      </Section>
    </ResponsivePage>
  )
}
