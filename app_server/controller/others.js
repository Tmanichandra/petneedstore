const about = (req, res) => {
    res.render('generic-text', {
        title: 'About',
        content: ['At PetNeeds, we are dedicated to enhancing the bond between pets and owners through top- quality products that cater to unique needs.We prioritize safety, sustainability, and pet wellness, aiming to be your trusted partner in pet happiness and health. This project has been created by Abdus Samad (21EG106B01), Kotha Siri (21EG106B55), \nManichandra (21EG106B59)']
    });
};

module.exports = {
    about
};