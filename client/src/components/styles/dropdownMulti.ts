import { StylesConfig } from 'react-select';

type OptionType = { value: string; label: string };

export const customStylesMulti: StylesConfig<OptionType, true> = {
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
    }),

    multiValue: (provided) => ({
        ...provided,
        backgroundColor: 'coral',
        borderRadius: '6px',
    }),

    multiValueLabel: (provided) => ({
        ...provided,
        color: 'white',
        backgroundColor: 'coral',
        borderTopLeftRadius: '6px',
        borderBottomLeftRadius: '6px',
        padding: '2px'
    }),

    multiValueRemove: (provided) => ({
        ...provided,
        borderTopRightRadius: '6px',
        borderBottomRightRadius: '6px'
    })
}
