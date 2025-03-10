# PowerApps Compoenent Framework: TreeLookup
PowerApps Component framework (PCF) Control that renders a Lookup that allows to select value from a tree view.
 
**IMPORTANT : The control needs to be configured using the Classic UI see issue [#29](https://github.com/drivardxrm/LookupDropdown.PCF/issues/29) for more info** 

<ins>Credits: Some features was inspired by [LookupDropdown.PCF](https://github.com/drivardxrm/LookupDropdown.PCF)</ins>

![demo](/docs/recordemo.gif)

## Features

:heavy_check_mark: Out of the box filtering configuration


## Configuration

| Configuration Name  | Description | Exemple |
| ------------- | ------------- |------------- |
| Main LookUp | Lookup field to bound the PCF to  | fdn_insuranceproductid |
| Group By  | Comma seperated logical attribute names to group the search results by. Supports related lookup fields  | fdn_insurancesubcategory.fdn_insurancecategory,<br/>fdn_insurancesubcategory  |
| Dependent Lookup field | When dependent filtering is configured , must bound this configuration with the dependant lookup field | createdby  |

![image](/docs/TreeLookupConfig.png)

