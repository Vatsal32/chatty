import React from 'react';
import {Box, Button, Container, Grid, Link, TextField, Typography} from "@mui/material";
import {gql, useMutation} from "@apollo/client";
import {useHistory} from "react-router-dom";

const LOGIN_MUTATION = gql`
    mutation LoginQuery($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            user {
                id
            }
        }
    }
`;

function Login(props: Object ) {

    const errors = {userName: null, password: null};

    const history = useHistory();

    const [makeMutation] = useMutation(LOGIN_MUTATION);

    const handleLogin = async (e: any) => {
        e.preventDefault();
        const formElement = e.currentTarget;
        const formData = new FormData(formElement);
        let LoginData = {
            email: formData.get('email'),
            password: formData.get('password'),
        };
        makeMutation({
            variables: LoginData
        }).then((res) => {
            history.push('/');
        }).catch(err => console.log(err.message));
    };

    return (
        <Container component={'main'} maxWidth={'xs'}>
            <Box component={'form'} onSubmit={handleLogin}
                 sx={{marginTop: '10rem', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Typography component={'h1'} variant={'h5'}>Login</Typography>
                <TextField name={'email'} margin={'normal'} required fullWidth id={'email'}
                           error={Boolean(errors.userName)}
                           label={'Email Address'} variant={'outlined'} autoFocus type={'email'}
                           helperText={errors.userName}/>
                <TextField name={'password'} margin={'normal'} required fullWidth id={'password'}
                           error={Boolean(errors.password)}
                           label={'Password'} variant={'outlined'} type={'password'} helperText={errors.password}/>
                <Button type={'submit'} fullWidth variant={'contained'} sx={{mt: 3, mb: 2}}>Login</Button>
            </Box>

            <Grid container sx={{display: 'flex', justifyContent: 'center'}}>
                <Grid item>
                    <Link href={'/signup'} variant={'body2'}>Don't have an account? Signup</Link>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Login;