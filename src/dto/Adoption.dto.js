export default class AdoptionDTO {
    static getAdoptionInputFrom = (data) => {
        return {
            owner: data.owner || null,
            pet: data.pet || null,
            createdAt: new Date()
        }
    }

    static getAdoptionOutputFrom = (adoption, user, pet) => {
        return {
            id: adoption._id,
            timestamp: adoption.createdAt || new Date().toISOString(),
            user: {
                id: user._id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email
            },
            pet: {
                id: pet._id,
                name: pet.name,
                specie: pet.specie,
                adopted: true
            }
        }
    }
}