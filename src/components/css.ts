import type { TableStyleOptions, FormStyle, TableStyle } from '@/types'
import { Sole } from '@/use/config'

function hasTableStyle(style:TableStyleOptions, target:TableStyle) {
    return Array.isArray(style)
        ? style.indexOf(target) >= 0
        : style == target || style.includes(target)
}

export const a = {
    blue:   'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200',
    purple: 'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200',
    red:    'text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200',
    green:  'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200',
    sky:    'text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200',
    cyan:   'text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200',
    indigo: 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200',
}
export const input = {
    base:    'block w-full sm:text-sm rounded-md dark:text-white dark:bg-gray-900 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 disabled:border-slate-200 dark:disabled:border-slate-700 disabled:shadow-none',
    invalid: 'pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500',
    valid:   'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 dark:border-gray-600',
}

export const card = {
    panelClass: "shadow sm:rounded-md",
    formClass: "space-y-6 bg-white dark:bg-black py-6 px-4 sm:p-6",
    headingClass: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100",
    subHeadingClass: "mt-1 text-sm text-gray-500 dark:text-gray-400",
}
export const slideOver = {
    panelClass: "pointer-events-auto w-screen xl:max-w-3xl md:max-w-xl max-w-lg",
    formClass: "flex h-full flex-col divide-y divide-gray-200 dark:divide-gray-700 shadow-xl bg-white dark:bg-black",
    titlebarClass: "bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6",
    headingClass: "text-lg font-medium text-gray-900 dark:text-gray-100",
    subHeadingClass: "mt-1 text-sm text-gray-500 dark:text-gray-400",
    closeButtonClass: "rounded-md bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:ring-offset-black",
}
export const modal = {
    modalClass: "relative transform overflow-hidden rounded-lg bg-white dark:bg-black text-left shadow-xl transition-all sm:my-8",
    sizeClass: "sm:max-w-prose lg:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl sm:w-full"
}
export const form = {
    panelClass(style:FormStyle = "slideOver") { return style == "card" ? card.panelClass : slideOver.panelClass },
    formClass(style:FormStyle = "slideOver") { return style == "card" ? card.formClass : slideOver.formClass },
    headingClass(style:FormStyle = "slideOver") { return style == "card" ? card.headingClass : slideOver.headingClass },
    subHeadingClass(style:FormStyle = "slideOver") { return style == "card" ? card.subHeadingClass : slideOver.subHeadingClass },
    buttonsClass: "px-4 py-3 bg-gray-50 dark:bg-gray-900 sm:px-6 flex flex-wrap justify-between",
    legendClass: "text-base font-medium text-gray-900 dark:text-gray-100 text-center mb-4",
}
export const grid = {
    getGridClass(style:TableStyleOptions="stripedRows") { return grid.gridClass },
    getGrid2Class(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"fullWidth")
        ? "overflow-x-auto" 
        : grid.grid2Class },
    getGrid3Class(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"fullWidth")
        ? "inline-block min-w-full py-2 align-middle"
        : grid.grid3Class },
    getGrid4Class(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"whiteBackground")
        ? ""
        : hasTableStyle(style,"fullWidth")
            ? "overflow-hidden shadow-sm ring-1 ring-black/5"
            : grid.grid4Class },
    getTableClass(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"fullWidth") || hasTableStyle(style,"verticalLines")
        ? "min-w-full divide-y divide-gray-300"
        : grid.tableClass },
    getTheadClass(style:TableStyleOptions="stripedRows") { return hasTableStyle(style,"whiteBackground")
        ? ""
        : grid.theadClass },
    getTheadRowClass(style:TableStyleOptions="stripedRows") { 
        return grid.theadRowClass + (hasTableStyle(style,"verticalLines") ? " divide-x divide-gray-200 dark:divide-gray-700" : "") },
    getTheadCellClass(style:TableStyleOptions="stripedRows") { 
        return grid.theadCellClass + (hasTableStyle(style,"uppercaseHeadings") ? " uppercase" : "") },
    getTbodyClass(style:TableStyleOptions="stripedRows") {
        return (hasTableStyle(style,"whiteBackground") || hasTableStyle(style,"verticalLines")
            ? "divide-y divide-gray-200 dark:divide-gray-800"
            : grid.tableClass)
        + (hasTableStyle(style,"verticalLines") ? " bg-white" : "") },
    getTableRowClass(style:TableStyleOptions="stripedRows", i:number, selected:boolean, allowSelection:boolean) {
        return (allowSelection ? "cursor-pointer " : "") + 
            (selected ? "bg-indigo-100 dark:bg-blue-800" : (allowSelection ? "hover:bg-yellow-50 dark:hover:bg-blue-900 " : "") + (hasTableStyle(style,"stripedRows")
                ? (i % 2 == 0 ? "bg-white dark:bg-black" : "bg-gray-50 dark:bg-gray-800")
                : "bg-white dark:bg-black")) + 
             (hasTableStyle(style,"verticalLines") ? " divide-x divide-gray-200 dark:divide-gray-700" : "")
    },

    gridClass: "flex flex-col",
    //original -margins + padding forces scroll bars when parent is w-full for no clear benefits?
    //original: -my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8
     grid2Class: "",
     //original: inline-block min-w-full py-2 align-middle md:px-6 lg:px-8
    grid3Class: "inline-block min-w-full py-2 align-middle",
    grid4Class: "overflow-hidden shadow ring-1 ring-black/5 md:rounded-lg",
    tableClass: "min-w-full divide-y divide-gray-200 dark:divide-gray-700",
    theadClass: "bg-gray-50 dark:bg-gray-900",
    tableCellClass: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400",
    theadRowClass: "select-none",
    theadCellClass: "px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap",
    toolbarButtonClass: "inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-black",
}
export const dummy = {
    colspans: "col-span-3 sm:col-span-3"
}

export function filterClass(cls:(string|undefined)[], type:string, fn?:((cls:string) => string)) {
  const joinCls = cls.filter(x => x).join(' ')
  fn ??= (Sole.config.filterInputClass == null ? undefined : cls => Sole.config.filterInputClass!(cls, type))
  return fn
    ? fn(joinCls) 
    : joinCls
}
