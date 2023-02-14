import type { TableStyleOptions, FormStyle, TableStyle } from '@/types'

function hasTableStyle(style:TableStyleOptions, target:TableStyle) {
    return Array.isArray(style)
        ? style.indexOf(target) >= 0
        : style == target || style.includes(target)
}

export class Css {

    public static a = {
        blue:   'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200',
        purple: 'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200',
        red:    'text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200',
        green:  'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200',
        sky:    'text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200',
        cyan:   'text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200',
        indigo: 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200',
    }

    public static card = {
        panelClass: "shadow sm:overflow-hidden sm:rounded-md",
        formClass: "space-y-6 bg-white dark:bg-black py-6 px-4 sm:p-6",
        headingClass: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100",
        subHeadingClass: "mt-1 text-sm text-gray-500 dark:text-gray-400",
    }

    public static slideOver = {
        panelClass: "pointer-events-auto w-screen xl:max-w-3xl md:max-w-xl max-w-lg",
        formClass: "flex h-full flex-col divide-y divide-gray-200 dark:divide-gray-700 shadow-xl bg-white dark:bg-black",
        titlebarClass: "bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6",
        headingClass: "text-lg font-medium text-gray-900 dark:text-gray-100",
        subHeadingClass: "mt-1 text-sm text-gray-500 dark:text-gray-400",
        closeButtonClass: "rounded-md bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:ring-offset-black",
    }

    public static form = {
        panelClass(style:FormStyle = "slideOver") { return style == "card" ? Css.card.panelClass : Css.slideOver.panelClass },
        formClass(style:FormStyle = "slideOver") { return style == "card" ? Css.card.formClass : Css.slideOver.formClass },
        headingClass(style:FormStyle = "slideOver") { return style == "card" ? Css.card.headingClass : Css.slideOver.headingClass },
        subHeadingClass(style:FormStyle = "slideOver") { return style == "card" ? Css.card.subHeadingClass : Css.slideOver.subHeadingClass },
        buttonsClass: "mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-900 sm:px-6 flex flex-wrap justify-between",
        legendClass: "text-base font-medium text-gray-900 dark:text-gray-100 text-center mb-4",
    }

    public static modal = {
        sizeClass: "sm:max-w-prose lg:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl sm:w-full"
    }

    public static grid = {
        getGridClass(style:TableStyleOptions="stripedRows") { return Css.grid.gridClass },
        getGrid2Class(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"fullWidth")
            ? "overflow-x-auto" 
            : Css.grid.grid2Class },
        getGrid3Class(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"fullWidth")
            ? "inline-block min-w-full py-2 align-middle"
            : Css.grid.grid3Class },
        getGrid4Class(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"whiteBackground")
            ? ""
            : hasTableStyle(style,"fullWidth")
                ? "overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5"
                : Css.grid.grid4Class },
        getTableClass(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"fullWidth") || hasTableStyle(style,"verticalLines")
            ? "min-w-full divide-y divide-gray-300"
            : Css.grid.tableClass },
        getTableHeadClass(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"whiteBackground")
            ? ""
            : Css.grid.tableHeadClass },
        getTableHeaderRowClass(style:TableStyleOptions="stripedRows") { 
            return Css.grid.tableHeaderRowClass + (hasTableStyle(style,"verticalLines") ? " divide-x divide-gray-200 dark:divide-gray-700" : "") },
        getTableHeaderCellClass(style:TableStyleOptions="stripedRows") { 
            return Css.grid.tableHeaderCellClass + (hasTableStyle(style,"uppercaseHeadings") ? " uppercase" : "") },
        getTableBodyClass(style:TableStyleOptions="stripedRows") {
            return (hasTableStyle(style,"whiteBackground") || hasTableStyle(style,"verticalLines")
                ? "divide-y divide-gray-200 dark:divide-gray-800"
                : Css.grid.tableClass)
            + (hasTableStyle(style,"verticalLines") ? " bg-white" : "") },
        getTableRowClass(style:TableStyleOptions="stripedRows", i:number, selected:boolean, allowSelection:boolean) {
            return (allowSelection ? "cursor-pointer " : "") + 
                (selected ? "bg-indigo-100 dark:bg-blue-800" : (allowSelection ? "hover:bg-yellow-50 dark:hover:bg-blue-900 " : "") + (hasTableStyle(style,"stripedRows")
                    ? (i % 2 == 0 ? "bg-white dark:bg-black" : "bg-gray-50 dark:bg-gray-800")
                    : "bg-white dark:bg-black")) + 
                 (hasTableStyle(style,"verticalLines") ? " divide-x divide-gray-200 dark:divide-gray-700" : "")
        },

        gridClass: "mt-4 flex flex-col",
        grid2Class: "-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8",
        grid3Class: "inline-block min-w-full py-2 align-middle md:px-6 lg:px-8",
        grid4Class: "overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg",
        tableClass: "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
        tableHeadClass: "bg-gray-50 dark:bg-gray-900",
        tableCellClass: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400",
        tableHeaderRowClass: "select-none",
        tableHeaderCellClass: "px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap",
        toolbarButtonClass: "inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-black",
    }
}
