const cron = require('node-cron');


cron.schedule('0 0 * * *', async function () {
    try {
        const categoriesToBeDeleted = await Category.find({
            markedForDeletion: true,
        });
        for (const category of categoriesToBeDeleted) {
            const categoryProductCount = await Product.countDocuments({
                category: category.id,
            });
            if (categoryProductCount < 1) await category.deleteOne();
        }
        console.log('CRON job completes at', new Date());
    } catch (error) {
        console.error('CRON job error: ', error);
    }
})