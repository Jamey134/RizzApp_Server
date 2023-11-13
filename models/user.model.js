const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true, // unique 
    },

    password: {
        type: String,
        required: true,
    },


    profilePic: {
        type: String,
        required: true,
        default: "https://static.thenounproject.com/png/5163895-200.png"
    }


},
    { timestamps: true }
);

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// The pre element allows authors to insert a preformatted text into the document
UserSchema.pre("save", async function (next) {
    if (!this.isModified) {
        next()
    }


    // A salt is a random piece of data that is used as an additional input to a one-way function that hashes data or a password. 
    // "this" keyword refers to an object.
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', UserSchema);

module.exports = User