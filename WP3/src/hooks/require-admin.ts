import permissions from 'feathers-permissions';

const checkPermissions = (permissions.default ?? permissions) as typeof permissions.default;

export const requireAdmin = checkPermissions({
    roles: ['admin'],
    field: 'role'
});