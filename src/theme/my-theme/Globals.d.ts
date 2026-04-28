declare module '*.module.css';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.webp';
declare module '*.svg';

declare module '@hubspot/cms-components';
declare module '@hubspot/cms-components/fields';
declare module 'react';
declare module 'react/jsx-runtime';

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}
