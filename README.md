# PowerApps Compoenent Framework: TreeLookup
Virtual PowerApps Component framework (PCF) Control that renders a Lookup that allows to select value from a tree view.
 
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
:heavy_check_mark: Display the first two columns of the current selected view as secondary text on the record tags in the tree view. \
![image](/docs/secondarytextlookup.png) \
:heavy_check_mark: Tree view works even if group by field are not part of the selected view. \
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

❌ Does not support pagination (yet? Contributions are welcomed), only the first 5000 records will show.


## Dos and Don'ts
:heavy_check_mark: dos:
 - Ideal for small to medium dataset
 - OptionSet and lookups are best column types for grouping your datasets
 - Group your dataset with fields which you know will hold same values across your dataset.

❌ Don'ts:
 - Do not group by your dataset by fields which you know will hold unique values.
 - Do not setup more than 3 group by fields as the performance may decrease
 - Do not use large text area in secondary text as the rendering may not look pretty
 - Do not use large text area in group by fields as the rendering may not look pretty
 - Do not use this pcf for large dataset selection as it will only show up to the first 5000 records.


## Configuration

| Configuration Name  | Description | Example |
| ------------- | ------------- |------------- |
| Main LookUp | Lookup field to bound the PCF to  | fdn_insuranceproductid |
| Group By  | Comma seperated logical **lowercase** attribute names to group the search results by.<br/>Supports related lookup fields.  | fdn_insurancesubcategory.fdn_insurancecategory,<br/>fdn_insurancesubcategory  |
| Dependent Lookup field | When dependent filtering is configured , must bound this configuration with the dependant lookup field | createdby  |

Example: \
![image](/docs/TreeLookupConfig.png)

## Dependencies

- [React](https://react.dev/)
- [Fluentui](https://react.fluentui.dev/)

## Contribute

Feel free to fork this repo and/or add features with pull request.

## Installation

Download solutions from the latest [release](https://github.com/dotnetprog/dataverse-pcf-lookup-treeview/releases/latest)




