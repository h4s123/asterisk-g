const getAvailableTrunks = async (req, res) => {
    try {
      const availableTrunks = await trunkModel.getAllTrunks(); // Assume `getAllTrunks` fetches trunk data from the database
      res.json(availableTrunks);
    } catch (error) {
      console.error('Error fetching trunks:', error);
      res.status(500).json({ message: 'Failed to fetch trunks' });
    }
  };
  
  module.exports = { getAvailableTrunks };
  