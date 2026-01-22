import mongoose from 'mongoose';

const collection = 'Pets';

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    specie: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    adopted: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        default: null
    },
    image: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

schema.index({ name: 1 });
schema.index({ specie: 1 });
schema.index({ adopted: 1 });

const petModel = mongoose.model(collection, schema);

export default petModel;