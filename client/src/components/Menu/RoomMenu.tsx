import React, {useState} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {Box, Button, Grid, IconButton, Typography} from "@mui/material";
import Modal from "@mui/material/Modal";
import {gql, useMutation} from "@apollo/client";
import MySearchField from "../../utils/MySearchField";

const ADD_USER_TO_ROOM = gql`
    mutation addUser($roomId: ID!, $userId: ID!) {
        addUser(userId: $userId, roomId: $roomId) {
            id
        }
    }
`;

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: '#292F32',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function BasicMenu(props: { roomId: string }) {
    const [value, setValue] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [modalOpen, setModelOpen] = useState<boolean>(false);
    const open = Boolean(anchorEl);
    const [addUser, receivedData] = useMutation(ADD_USER_TO_ROOM);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleModalClose = () => {
        setModelOpen(false);
        setValue('');
        setError('');
    };
    const handleAddUser = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            userId: formData.get('email'),
            roomId: props.roomId,
        }
        addUser({variables: data}).then(res => {
            setError('User added Successfully');
        }).catch(er => setError('Invalid Email'));
    }

    return (
        <>
            <IconButton
                id="basic-button"
                aria-controls="basic-menu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}>
                <MoreVertIcon/>
            </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                sx={{
                    '.MuiMenu-paper': {
                        backgroundColor: '#292F32',
                        color: 'white',
                        borderRadius: '5px',
                        boxShadow: '0 0 2px 1px rgba(0, 0, 0, 0.5)',
                    }
                }}>
                <MenuItem onClick={() => setModelOpen(true)}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
            </Menu>
            <Modal
                open={modalOpen}
                onClose={handleModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description">
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" color={'whitesmoke'}
                                margin={'1rem'}>
                        Enter the email ID of the new member
                    </Typography>
                    <Box component={'form'} onSubmit={handleAddUser}>
                        <Typography variant={'body2'} color={receivedData.data ? 'green' : 'red'} marginX={'1rem'} marginBottom={'1rem'}>
                            {error}
                        </Typography>
                        <MySearchField id={'email'} value={value} name={'email'}
                                       placeholder={'Enter the email'}
                                       multiLine={false} onChange={(e) => setValue(e.target.value)}
                                       width={'90%'}/>
                        <Grid sx={{display: "flex", justifyContent: 'space-between'}}>
                            <Button type={'submit'} variant={'contained'} color={'primary'}
                                    sx={{margin: '1rem'}}>
                                Add User
                            </Button>
                            <Button sx={{
                                margin: '1rem',
                                "&.MuiButton-contained": {
                                    backgroundColor: "gray"
                                }
                            }} onClick={handleModalClose} variant={'contained'}>
                                Cancel
                            </Button>
                        </Grid>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}