import * as XLSX from "xlsx";

const getFileName = (name: string, isCurrent: boolean) => {
  let timeSpan: any  = isCurrent ? new Date().toISOString() : '';
  let sheetName: any = name || "ExportResult";
  let fileName: any = name.includes(' to ') ? `${sheetName}-${timeSpan}` : name;
  sheetName = ((sheetName.length > 30) ? (sheetName.slice(0, 27) + "...") : sheetName);
  return {
    sheetName,
    fileName
  };
};
export class TableUtil {
  static exportTableToExcel(tableId: string, name: string, isCurrent: boolean) {
    let data: any = getFileName(name, isCurrent);
    let targetTableElm = document.getElementById(tableId);
    let wb = XLSX.utils.table_to_book(targetTableElm, <XLSX.Table2SheetOpts>{
      sheet: data.sheetName
    });
    XLSX.writeFile(wb, `${data.fileName}.xlsx`);
  }
  static exportJsonToExcel(fileName: string, jsonData: any) {
		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, fileName);
    XLSX.writeFile(wb, fileName + '.xlsx');
    return true;
  }

  static toUnicodeEscape(text: string): string {
  return text.split('').map(char => {
    const code = char.charCodeAt(0).toString(16).padStart(4, '0');
    return '\\u' + code;
  }).join('');
}
}


