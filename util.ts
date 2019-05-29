import dayjs = require('dayjs');

export const yearNow = dayjs().year()
export const stripTags = (val: any) => val.replace(/<(?:.|\n)*?>/gm, '')
export function trimArray(arr: any[]) {
    // Example: trimArray(['', '', 'abc', '', 'abc', 'abc', '', '']) -> ["abc", "", "abc", "abc"]
    const handleVal = (val: any) => {
        if (val !== '') {
            valPassed = true
            return val
        }
        else if (!valPassed) return null
        else return val
    }
    let valPassed = false
    arr = arr.map(handleVal)
    valPassed = false
    arr = arr.reverse().map(handleVal)
    return arr.reverse().filter((val) => val !== null)
}
