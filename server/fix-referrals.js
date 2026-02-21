const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const populateReferralCodes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ referralCode: { $exists: false } });
        console.log(`Found ${users.length} users without referral codes.`);

        for (const user of users) {
            // The pre-save hook will generate the code
            await user.save();
            console.log(`Generated referral code for: ${user.email} -> ${user.referralCode}`);
        }

        const nullUsers = await User.find({ referralCode: null });
        for (const user of nullUsers) {
            await user.save();
            console.log(`Fixed null referral code for: ${user.email} -> ${user.referralCode}`);
        }

        console.log('Finished populating referral codes.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

populateReferralCodes();
