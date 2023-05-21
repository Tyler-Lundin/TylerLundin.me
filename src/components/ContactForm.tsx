'use client'
import clsx from "clsx";
import { useForm } from "react-hook-form";

const
  FORM = clsx(
    'w-full max-w-2xl grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6',
    'text-black'
  ),
  FORM_INPUT = clsx(
  ),
  FORM_SUBMIT = clsx(
    'w-full sm:col-span-2 sm:col-start-1',
    'bg-emerald-400 hover:bg-emerald-700 text-black lowercase font-bold py-2 px-4 rounded',
  ),
  FORM_LABEL = clsx(
    'block uppercase tracking-wide dark:text-zinc-400 text-xs font-bold mb-2',
  ),
  FORM_TEXTAREA = clsx(
    'resize-none h-44',
  ),
  FORM_GROUP = clsx(
    'sm:col-span-2 sm:col-start-1 grid',
  );



export default function ContactForm() {
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful } } = useForm();

  const onSubmit = async (data: any) => {
    try {

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
      console.log({ res })
    }
    catch (error: any) {
      console.error(error)
    }
  };


  if (isSubmitSuccessful) return (
    <div className='text-center'>
      <h1 className='text-2xl mb-4 lg:text-5xl font-black'>Thank you for your message!</h1>
      <p className='text-lg'>I will get back to you as soon as possible.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={FORM}>
      <div className={FORM_GROUP}>
        <label className={FORM_LABEL} htmlFor="name">Name</label>
        {errors.name && <span className={FORM_LABEL}>This field is required</span>}
        <input {...register('name', { required: true })} className={FORM_INPUT} type="text" name="name" placeholder="Name" />
      </div>
      <div className={FORM_GROUP}>
        <label className={FORM_LABEL} htmlFor="email">Email</label>
        {errors.email && <span className={FORM_LABEL}>This field is required</span>}
        <input {...register('email', { required: true })} className={FORM_INPUT} type="email" name="email" placeholder="Email" />
      </div>
      <div className={FORM_GROUP}>
        <label className={FORM_LABEL} htmlFor="message">Message</label>
        {errors.message && <span className={FORM_LABEL}>This field is required</span>}
        <textarea {...register('message', { required: true, maxLength: 20 })} className={FORM_TEXTAREA} name="message" placeholder="Message" />
      </div>
      <button className={FORM_SUBMIT} type="submit">Send</button>
    </form>

  )
}
