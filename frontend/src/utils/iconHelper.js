/**
 * Icon Helper Utility
 * Provides functions for rendering icons with accessibility labels
 */

import ICONS from '../constants/icons';

/**
 * Mapping of icon keys to accessibility labels
 */
export const ICON_LABELS = {
    JOBS: 'Jobs',
    APPLICATIONS: 'My Applications',
    PROFILE: 'Profile',
    DASHBOARD: 'Dashboard',
    SETTINGS: 'Settings',
    ADD: 'Add',
    DELETE: 'Delete',
    EDIT: 'Edit',
    SAVE: 'Save',
    CANCEL: 'Cancel',
    SEARCH: 'Search',
    FILTER: 'Filter',
    COMPANY: 'Company',
    VERIFY: 'Verify',
    REJECT: 'Reject',
    PENDING: 'Pending',
    LOCATION: 'Location',
    EMAIL: 'Email',
    PHONE: 'Phone',
    ADDRESS: 'Address',
    FILE: 'File',
    FOLDER: 'Folder',
    FOLDER_OPEN: 'Open Folder',
    UPLOAD: 'Upload',
    DOWNLOAD: 'Download',
    RESUME: 'Resume',
    USER: 'User',
    USERS: 'Users',
    TARGET: 'Target',
    TROPHY: 'Trophy',
    STAR: 'Star',
    BADGE: 'Badge',
    EDUCATION: 'Education',
    ARROW_DOWN: 'Down',
    ARROW_UP: 'Up',
    MENU: 'Menu',
    CLOSE: 'Close',
    LOGOUT: 'Logout',
    LOGIN: 'Login',
    SUCCESS: 'Success',
    ERROR: 'Error',
    WARNING: 'Warning',
    INFO: 'Information',
    LOADING: 'Loading',
    LOGO: 'Naukri',
};

/**
 * Get an icon emoji by key
 * @param {string} iconKey - The key of the icon from ICONS constant
 * @returns {string} The emoji character
 */
export function getIcon(iconKey) {
    return ICONS[iconKey] || '';
}

/**
 * Get the accessibility label for an icon
 * @param {string} iconKey - The key of the icon
 * @returns {string} The accessibility label
 */
export function getIconLabel(iconKey) {
    return ICON_LABELS[iconKey] || '';
}

/**
 * Render an icon with accessibility attributes
 * @param {string} iconKey - The key of the icon
 * @param {string} className - Optional CSS class name
 * @returns {string} The emoji icon (with aria-label via accessibility)
 */
export function renderIcon(iconKey, className = '') {
    const icon = getIcon(iconKey);
    const label = getIconLabel(iconKey);
    return icon;
}

/**
 * Create an accessible icon span element props object
 * @param {string} iconKey - The key of the icon
 * @param {object} props - Additional props to merge
 * @returns {object} Props object for icon span element
 */
export function getIconProps(iconKey, props = {}) {
    return {
        role: 'img',
        'aria-label': getIconLabel(iconKey),
        ...props,
    };
}

export default {
    getIcon,
    getIconLabel,
    renderIcon,
    getIconProps,
};
