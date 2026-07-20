import { Fragment } from 'react';

/**
 * Renders arbitrary text, styling every "NuraLoka" occurrence with the
 * .nuraloka-text / .nura / .loka classes from app.css instead of plain text.
 */
export default function BrandText({ text }) {
    const parts = String(text ?? '').split('NuraLoka');

    return parts.map((part, index) => (
        <Fragment key={index}>
            {part}

            {index < parts.length - 1 && (
                <span className="nuraloka-text">
                    <span className="nura">Nura</span>
                    <span className="loka">Loka</span>
                </span>
            )}
        </Fragment>
    ));
}
