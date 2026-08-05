import { StylesConfig } from 'react-select';

type OptionType = { value: number; label: string };

export const customStylesSingle: StylesConfig<OptionType, false> = {
    container: (provided) => ({
        ...provided,
        backgroundColor: 'transparent',
    }),

    placeholder: (provided) => ({
        ...provided,
        color: 'white'
    }),
    // Styles the main container box
    control: (provided) => ({
        ...provided,
        color: 'white',
        border: '1px solid transparent',
        backgroundColor: 'hsla(204, 85%, 56%, 0.747)',
        width: '300px',
        '&:hover': {
            cursor: 'pointer',
            backgroundColor: 'hsla(202, 83%, 60%, 0.884)',
            border: '1px solid coral',
        },
    }),
    // Styles individual dropdown options
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected 
        ? '#3b82f6' 
        : state.isFocused 
            ? 'hsl(219, 90%, 52%)' 
            : 'hsla(202, 83%, 60%, 0.884)',
        color: '#ffffff',
        cursor: 'pointer',
    }),
    // Styles the dropdown menu wrapper
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'hsla(202, 83%, 60%, 0.884)',
        borderRadius: '8px',
    }),
    // Styles text colors
    singleValue: (provided) => ({
        ...provided,
        color: '#ffffff',
    })
}
