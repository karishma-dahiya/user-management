import {
    Box,
    Button,
    Input,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    FormControl,
    FormLabel,
    Flex,
    Heading,
    HStack,
    Text,
    useToast,
    Spinner
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', age: '' });
    const [editUserId, setEditUserId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); 
    const [totalPages, setTotalPages] = useState(1); 
    const pageSize = 5;
    const [loading, setLoading] = useState(false);

    const toast = useToast();


    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchUsers = async (page = 1, limit = 5) => {
        try {
            setLoading(true);
            const response = await fetch(`${url}/users?page=${page}&limit=${limit}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch users');
            }
            console.log("Users data:", data);
            if (data.users) {
                
                setUsers(data.users);
                setTotalPages(data.pagination.totalPages);
                setCurrentPage(data.pagination.currentPage);
            }
            
        } catch (error) {
            console.log(error);
            toast({
                title: "Error fetching users",
                description: error.message || "An error occurred. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage, pageSize);
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            fetchUsers(prevPage, pageSize); 
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const nextPage = currentPage + 1;
            fetchUsers(nextPage, pageSize);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (editUserId) {
                const response = await axios.put(`${url}/users/${editUserId}`, formData);
                console.log("User updated:", response.data);
                if (response.status !== 200) {
                    throw new Error('Failed to update user');
                }
            } else {
                const response = await axios.post(`${url}/users`, formData);
                console.log("User added:", response.data);
                if (response.status !== 201) {
                    throw new Error('Failed to add user');
                }
            }
           
            toast({
                title: editUserId ? "Users updated successfully!" : "User added successfully!",
                description: editUserId ? "User details have been updated." : "New user has been added.",
                status: "success",
                duration: 3000,  
                isClosable: true,  
            });
            setFormData({ name: '', email: '', age: '' });
            setEditUserId(null);
            onClose();
            fetchUsers();
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: err.message || "An error occurred. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }finally {
            setLoading(false);
        }
    };

    const checkEmailExists = async (email) => {
        try {
            const response = await axios.get(`${url}/users/email/${email}`);
            if (!response.data || !response.data.email) {
                return false; 
            } else {
                return true; 
            }
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    };
    const validateFormData = (formData) => {
      
        if (!formData.name || !formData.email || !formData.age) {
            toast({
                title: "All fields are required",
                description: "Please fill in all fields.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return false; 
        }

 
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!isEmail.test(formData.email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }

        if (isNaN(formData.age) || formData.age <= 0) {
            toast({
                title: "Invalid Age",
                description: "Please enter a valid age greater than 0.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false; 
        }

        return true; 
    };

    const handleSubmitData = async (e) => { 
        e.preventDefault();
        try {
            const validated = validateFormData(formData);
            if (!validated) {
                return;
            }
            
            if (editUserId) {
                handleSubmit();
            } else {
                const emailExists = await checkEmailExists(formData.email);
                if (emailExists) {
                    toast({
                        title: "Email already exists",
                        description: "Please use a different email.",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    return;
                }
                handleSubmit();
            }
            
        } catch (error) {
            console.error(error);
        }
    }

    const handleEdit = (user) => {
        setFormData({ name: user.name, email: user.email, age: user.age });
        setEditUserId(user._id);
        onOpen();
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const response = await axios.delete(`${url}/users/${id}`);
            if (response.status !== 200) {
                throw new Error('Failed to delete user');
            }
            toast({
                title: "User deleted successfully!",
                description: "User has been removed.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchUsers(currentPage, pageSize); 

        } catch (error) {
            console.error(error);
            toast({
                title: "Error deleting user",
                description: error.message || "An error occurred. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
       
    };
    const handleOpenModal = () => {
        setFormData({ name: '', email: '', age: '' });
        setEditUserId(null);
        onOpen();
    };
    const handleCloseModal = () => {
        setEditUserId(null);
        setFormData({ name: '', email: '', age: '' });
        onClose();
    }

    if(loading) {
        return (
            <Box maxW="1200px" mx="auto" mt={8} p={6} bg="white" rounded="lg" boxShadow="lg">
                <Spinner size="xl"/>
            </Box>
        );
    }

    return (
        <Box maxW="1200px" mx="auto" mt={8} p={6} bg="white" rounded="lg" boxShadow="lg">
            

           

            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap">
                <Heading size="lg" mb={4} w="full" textAlign={{ base: "center", md: "left" }}>
                    User Management
                </Heading>
                <Button
                    colorScheme="teal"
                    onClick={() => handleOpenModal()}
                    ml="auto" 
                >
                   + Add User
                </Button>
            </Flex>

            <Box overflowX="auto">
               
                <Table variant="striped" colorScheme="gray" mt={2} borderWidth={1} borderColor="gray.200" rounded="md" boxShadow="md">
                    <Thead py={4}  textColor="gray.700">
                        <Tr>
                            <Th fontSize="md">Name</Th>
                            <Th fontSize="md">Email</Th>
                            <Th fontSize="md">Age</Th>
                            <Th fontSize="md" textAlign="center">Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {users.map((user) => (
                            <Tr key={user._id} _hover={{ bg: "gray.50" }}>
                                <Td fontWeight="semibold">{user.name}</Td>
                                <Td>{user.email}</Td>
                                <Td>{user.age}</Td>
                                <Td textAlign="center">
                                    <HStack spacing={3} justify="center">
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            variant="outline"
                                            leftIcon={<EditIcon />}
                                            onClick={() => handleEdit(user)}
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            size="sm"
                                            colorScheme="red"
                                            leftIcon={<DeleteIcon />}
                                            onClick={() => handleDelete(user._id)}
                                        >
                                            Delete
                                        </Button>
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            <Flex justify="space-between" align="center" mt={4}>
                <Button colorScheme='blue' size="sm" onClick={handlePreviousPage} isDisabled={currentPage === 1}>Prev</Button>
                <HStack>
                    <Text fontWeight="medium">Page {currentPage } of {totalPages}</Text>
                </HStack>
                <Button colorScheme='blue' size="sm" onClick={handleNextPage} isDisabled={currentPage === totalPages }>Next</Button>
            </Flex>

      
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editUserId ? 'Edit User' : 'Add User'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={3}>
                            <FormLabel>Name</FormLabel>
                            <Input name="name" value={formData.name} onChange={handleChange} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Email</FormLabel>
                            <Input
                                isReadOnly={!!editUserId} 
                                _readOnly={{ bg: 'gray.100', cursor: 'not-allowed', borderColor: 'gray.300' }}
                                name="email"
                                value={formData.email}
                                onChange={handleChange} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Age</FormLabel>
                            <Input name="age" type="number" value={formData.age} onChange={handleChange} />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmitData}>
                            {editUserId ? 'Update' : 'Add'}
                        </Button>
                        <Button variant="ghost" onClick={() => handleCloseModal}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default UserList;
