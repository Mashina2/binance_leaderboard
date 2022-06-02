
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import { getServerSideCookie } from "../helpers/cookieHandler";

import Parent from "../components/Parent";

console.log('sdfdsfdsfdsfdsfsfsfdsffsdfdsfsdfsdfdsfsdfdsf');

export default function Home() {
  
  return (
    <div className="main">
    {/* <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" /> */}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"  />
    <Parent  />
  </div>
  )
}


