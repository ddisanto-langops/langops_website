import { StylesConfig } from 'react-select';

type OptionType = { value: number; label: string };

export const customStylesSingle: StylesConfig<OptionType, false> = {
    container: (provided) => ({
        ...provided,
        backgroundColor: 'transparent'
    }),

    placeholder: (provided) => ({
        ...provided,
        color: 'white'
    }),
    // Styles the main container box
    control: (provided) => ({
        ...provided,
        width: "auto",
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
        background: state.isFocused 
            ? "linear-gradient(35deg, #d68437, rgb(16, 142, 209))" 
            : "none",
        borderRadius: "6px",
        boxShadow: state.isFocused
            ? "0 4px 15px rgba(16, 142, 209, 0.4), 0 2px 8px rgba(214, 132, 55, 0.3)"
            : "none",
        transition: "all 0.2s ease-in-out",
        justifySelf: "center",
        margin: "10px",
        padding: "5px",
        color: '#ffffff',
        cursor: 'pointer'
    }),
    // Styles the dropdown menu wrapper
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'hsl(202, 83%, 60%)',
        borderRadius: '8px',
        width: "max-content"
    }),

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
    }),

    menuList: (provided) => ({
        ...provided,
        borderRadius: "6px",
        width: "max-content",
        overflowX: "hidden",
        padding: "7px",

        "::-webkit-scrollbar": {
            width: "10px"
        },
        "::-webkit-scrollbar-track": {
            backgroundColor: "rgb(13,130,191)",
            borderRadius: "6px",
        }
    })
}
