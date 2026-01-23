export default class MockDTO {
    static getMockUser = (userData) => {
        return {
            _id: userData._id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            pets: userData.pets || [],
            documents: userData.documents || [],
            last_connection: userData.last_connection || new Date()
        }
    }

    static getMockPet = (petData) => {
        return {
            _id: petData._id,
            name: petData.name,
            specie: petData.specie,
            birthDate: petData.birthDate,
            adopted: petData.adopted || false,
            owner: petData.owner || null,
            image: petData.image || ''
        }
    }
}