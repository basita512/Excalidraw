"use client";

import { useState } from "react"
import Button from "components/ui/Button";
import BottomWarning from "components/ui/BottomWarning"
import Heading from "components/ui/Heading"
import SubHeading  from "components/ui/SubHeading"
import InputBox from "components/ui/InputBox"
import ErrorAlert from "components/ui/ErrorAlert"
import axios from "axios"
import { BACKEND_URL } from "../app/config"

export default function AuthPage ({ AuthType } : { AuthType : boolean }) {
    const isSignIn = AuthType
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [errorMessage, setErrorMessgae] = useState('')

    const handleSignIn = async() => {
        setErrorMessgae('')

        try {
            const response = await axios.post(`${BACKEND_URL}/signin`, {
                username : username,
                password : password
            })

            localStorage.setItem('token', response.data.token)
            localStorage.setItem('userId', response.data.userId)
            // Add navigation to the canvas board

        } catch (error : any) {
            if (error.response) {
                setErrorMessgae(error.response.data.message)
            } else {
                setErrorMessgae('Something went wrong')
            }
        }
    }

    const handleSignUp = async() => {
        setErrorMessgae('')

        try {
            const response = await axios.post(`${BACKEND_URL}/signup`, {
                username : username,
                password : password,
                name : name
            })

            localStorage.setItem('token', response.data.token)
            // Add navigation to canvas page

        } catch (error : any) {
            if (error.response) setErrorMessgae(error.response.data.message)
            else setErrorMessgae('Something went wrong')
        }
    }

    return (
        <div className="bg-gradient-to-b from-[#29a699f6] via-[#83d4aef6] to-[#bcffe0f6] h-screen w-full flex flex-col justify-center items-center">
            <div className="card flex flex-col justify-center items-center bg-white py-2 px-7 rounded-xl shadow-xl shadow-[#3c7b74f6] w-90 h-max  ">
                <Heading label={isSignIn ? 'Sign in' : 'Sign up'} />

                <SubHeading label={isSignIn ? 'Enter your credentials to access your account' : 'Enter your information to create an account'} />

                {
                    isSignIn ? '' : 
                        <InputBox
                            label={'Name'}
                            placeholder={'Enter your Name'}
                            value={name}
                            onChange={(e) => {setName(e.target.value)}}
                            name={'name'}
                            type={'text'}
                        />
                }
                
                <InputBox
                    label={'Username'}
                    placeholder={'Enter your Username'}
                    value={username}
                    onChange={(e) => {setUsername(e.target.value)}}
                    name={'Username'}
                    type={'text'}
                />

                <InputBox
                    label={'Password'}
                    placeholder={'Enter your Password'}
                    value={password}
                    onChange={(e) => {setPassword(e.target.value)}}
                    name={'password'}
                    type={'password'}
                />

                { errorMessage && <ErrorAlert errorMessage={errorMessage} /> }

                <Button
                    className=""
                    label={isSignIn ? 'Sign in' : 'Sign up'}
                    onClick={isSignIn ? handleSignIn : handleSignUp}/>

                <BottomWarning 
                    label={isSignIn ? 'Dont have an account ? ' : 'Already have an account ? '} 
                    bottomText={isSignIn ? 'Sign Up' : 'Login' } 
                    to={isSignIn ? '/signup' : '/signin'} />
            </div>
        </div>
    )
}
