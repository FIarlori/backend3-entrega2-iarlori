import mongoose from "mongoose";

const collection = "Adoptions";

const schema = new mongoose.Schema({
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true
    },
    pet: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Pets',
        required: true
    }
}, {
    timestamps: true
});

schema.index({ owner: 1, pet: 1 });

const adoptionModel = mongoose.model(collection, schema);

export default adoptionModel;