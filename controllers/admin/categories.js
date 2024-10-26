exports.addCategory = async (req, res) => {
    try {

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, messgae: error.messgae });
    }
}

exports.editCategory = async (req, res) => { }

exports.deleteCategory = async (req, res) => { }