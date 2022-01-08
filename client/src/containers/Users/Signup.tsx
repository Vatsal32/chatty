import React, {useState} from 'react';
import {Box, Button, Container, TextField, Typography} from "@mui/material";
import {gql, useMutation} from "@apollo/client";
import {useHistory} from "react-router-dom";

function Signup(props: Object) {
    const [error, setError] = useState({name: '', emailId: '', password: '', confirmPassword: ''});

    const signupMutation = gql`
        mutation signupMutation($avatar: String, $name: String!, $email: String!, $password: String!) {
            signup(avatar: $avatar, name: $name, email: $email, password: $password) {
                email
            }
        }
    `;

    const [doSignup] = useMutation(signupMutation);

    const history = useHistory();

    const handleSignupRequest = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        let myErrors = {};

        if (formData.get('password') !== formData.get('confirmPassword')) {
            myErrors = {
                ...myErrors,
                confirmPassword: 'Passwords don\'t match',
            };
        }

        if (Object.keys(myErrors).length > 0) {
            console.log(myErrors);
            setError({
                name: '', emailId: '', password: '', confirmPassword: '',
                ...myErrors
            });
        } else {
            const data: { [key: string]: string } = {
                name: formData.get('name') as string,
                email: formData.get('emailId') as string,
                password: formData.get('password') as string,
            };
            doSignup({variables: data}).then((res) => {
                console.log(res.data.signup);
                history.push('/login', res.data.signup.email);
            }).catch(err => console.log(err));
        }
    }

    return (
        <Container component={'main'} maxWidth={'xs'}>
            <Box component={'form'} onSubmit={handleSignupRequest}
                 sx={{marginTop: '10rem', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Typography component={'h1'} variant={'h5'}>Signup</Typography>
                <TextField name={'name'} margin={'normal'} variant={'outlined'} id={'name'} helperText={error.name}
                           fullWidth label={'Full Name'} type={'text'} required autoFocus error={Boolean(error.name)}/>
                <TextField name={'emailId'} margin={'normal'} variant={'outlined'} id={'emailId'}
                           helperText={error.emailId}
                           fullWidth label={'Email Address'} type={'email'} required error={Boolean(error.emailId)}/>
                <TextField name={'password'} margin={'normal'} variant={'outlined'} id={'password'}
                           helperText={error.password}
                           fullWidth label={'Password'} type={'password'} required error={Boolean(error.password)}/>
                <TextField name={'confirmPassword'} margin={'normal'} variant={'outlined'}
                           id={'confirmPassword'} error={Boolean(error.confirmPassword)}
                           helperText={error.confirmPassword}
                           fullWidth label={'Confirm password'} type={'password'} required/>

                <Button type={'submit'} fullWidth variant={'contained'} sx={{mt: 3, mb: 2}}>Signup</Button>
            </Box>
        </Container>
    );
}

export default Signup;