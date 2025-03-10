# PowerApps Compoenent Framework: TreeLookup
PowerApps Component framework (PCF) Control that renders a Lookup that allows to select value from a tree view.
 
**IMPORTANT : The control needs to be configured using the Classic UI see issue [#29](https://github.com/drivardxrm/LookupDropdown.PCF/issues/29) for more info** 

<ins>Credits: Some features was inspired by [LookupDropdown.PCF](https://github.com/drivardxrm/LookupDropdown.PCF) by [David Rivard](https://github.com/drivardxrm)</ins>

![demo](/docs/recordemo.gif)

## Features

:heavy_check_mark: Out of the box related records filtering configuration \
![image](/docs/relatedrecordsfiltering.png) \
:heavy_check_mark: Out of the box view selector configuration \
:heavy_check_mark: Out of the box field behavior configuration \
:heavy_check_mark: Allow users to filter the tree by keywords (Search Text box) \
:heavy_check_mark: GroupBy supports usage of field from a lookup field. ex: lookupfield.field \
:heavy_check_mark: Display the first two columns as secondary text on the record tags in the tree view. \
![image](/docs/secondarytextlookup.png) \
:heavy_check_mark: GroupBy supports Columns Types:
- Text (string)
- Numeric (Integer,Decimal,Money)
- OptionSet
- Two Options (Boolean)
- Lookup
- Date

❌ GroupBy **does not** supports Columns Types:
- MultiOptionSets
- MultiLookups (ex: email.torecipients)
- File
- Image
- Formulas/Calculated fields. (Haven't tested , it may work let me know)

## Configuration

| Configuration Name  | Description | Exemple |
| ------------- | ------------- |------------- |
| Main LookUp | Lookup field to bound the PCF to  | fdn_insuranceproductid |
| Group By  | Comma seperated logical attribute names to group the search results by. Supports related lookup fields  | fdn_insurancesubcategory.fdn_insurancecategory,<br/>fdn_insurancesubcategory  |
| Dependent Lookup field | When dependent filtering is configured , must bound this configuration with the dependant lookup field | createdby  |

Exemple: \
![image](/docs/TreeLookupConfig.png)

