const express = require('express');
const router = express.Router();
const Role = require('../../models/Role');
const { protect, authorize } = require('../../middleware/auth');

// Get all roles
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
});

// Get single role
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role', error: error.message });
  }
});

// Create role
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description, permissions, isDefault } = req.body;
    
    // Check if role exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    // Create role
    const role = await Role.create({
      name,
      description,
      permissions,
      isDefault
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error creating role', error: error.message });
  }
});

// Update role
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description, permissions, isDefault } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Update role
    role.name = name || role.name;
    role.description = description || role.description;
    role.permissions = permissions || role.permissions;
    role.isDefault = isDefault !== undefined ? isDefault : role.isDefault;

    await role.save();

    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: error.message });
  }
});

// Delete role
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check if role is default
    if (role.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default role' });
    }

    await role.remove();
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting role', error: error.message });
  }
});

module.exports = router; 