var tabNewProcesses = (ID, tabID) => {

    require(['text!' + ComponentsPath + 'tab-new-processes/tab-new-processes.html']);
    require(['css!' + cssloadpath + 'tab-new-processes/tab-new-processes.css']);

    let _groupDocumentIndexing = null;

    function OriginationTab(order, viewName, icon, description) {
        this.order = order;
        this.viewName = viewName;
        this.icon = icon;
        this.description = description;
    }

    function ViewModel() {
        let self = this;
        
        this.tabNewProcesses = ko.observable();
        this.headerText = ko.observable("Index documents");
        this.originationTabs = ko.observableArray(gPopupMetaData.data[ID].tabsObjects);
        self.currentStep = ko.observable(0);
        this.columnsArray = ko.observableArray();
        this.tabs = ko.observableArray();
        this.ExistingIDNo_Passport = ko.observable();
        this.ExistingFirstName = ko.observable();
        this.ExistingLastName = ko.observable();
        this.ExistingMemberNo = ko.observable();
        this.ExistingForeignIDNo_Passport = ko.observable();
        this.ExistingForeignFirstName = ko.observable();
        this.ExistingForeignLastName = ko.observable();
        this.ExistingForeignMemberNo = ko.observable();
        this.configureWorkFlow = (item) => {
            if (item) {
                let generalProcessesData = gPopupMetaData.data[51].ExtraData[0].data.processTabs.find(x => x.description === 'General Processes');

                if (generalProcessesData) {
                    let processCategory = generalProcessesData.processCategories.find(c => c.process_Category_ID === item.process_Category_ID);

                    if (processCategory && processCategory.description === 'Transaction Batches') {
                        switch (item.workflow_Name) {
                            case "New Transaction Batch":
                                taskBatchTransactions(55);
                                taskNotification(55);
                                $('#gBatchTransaction').modal({ "show": true, "backdrop": "static", "keyboard": false });
                                break;
                            case "Upload Batch":
                                taskImportBatchTransactions(56);
                                taskNotification(56);
                                $('#gImportBatchTransaction').modal({ "show": true, "backdrop": "static", "keyboard": false });
                                break;
                        }
                    }
                    else if (processCategory && processCategory.description === "Disbursements") {
                        taskNewDisbursement(93);
                        $('#newDisbursement').modal({ "show": true, "backdrop": "static", "keyboard": false });
                    }
                    else if (processCategory && processCategory.description === 'Documents') {
                        switch (item.workflow_Name) {
                            case "Index Documents":
                                SearchGroupDocumentIndexing("new-processes-documents-indexdocuments");
                                $("#new-processes-documents-indexdocuments  .components-new-processes .item").click();
                                $("#new-processes-documents-indexdocuments").parents()[1].children[1].style.display = "none";
                                break;
                        }
                    }
                    else if (gPopupMetaData.data[51].ExtraData[0].data.ssisPackageWorkflowData.hasOwnProperty(item.workflow_ID) &&
                        !gPopupMetaData.data[51].ExtraData[0].data.ssisPackageWorkflowData[item.workflow_ID]) {
                        // SSIS Packages WITHOUT parameters
                        if (item.numberOfWorkflowSteps === 0) {
                            PostJSONDATA({
                                URL: developmentServiceUrl.concat('processmanagerservice/api/SSISPackage/ExecuteSSISPackage/' + item.workflow_ID + '/' + getCookie("username")),
                                CALLBACK: (data) => {
                                    gPopupMetaData.data[15].tabsObjects[97].notificationErrors([]);
                                    if (data.succeeded) {
                                        if (data.statusCode === 200) {
                                            gPopupMetaData.data[15].tabsObjects[97].notificationErrors.push(new Msgerror(data.result, "success"));
                                            gPopupMetaData.data[15].tabsObjects[97].slideToggle();
                                        }
                                        else {
                                            gPopupMetaData.data[15].tabsObjects[97].notificationErrors.push(new Msgerror(data.errorMessage, "error"));
                                            gPopupMetaData.data[15].tabsObjects[97].slideToggle();
                                        }
                                    } else {
                                        gPopupMetaData.data[15].tabsObjects[97].notificationErrors.push(new Msgerror(data.errorMessage, "error"));
                                        gPopupMetaData.data[15].tabsObjects[97].slideToggle();
                                    }
                                },
                                ERROR: (data) => {
                                    gPopupMetaData.data[15].tabsObjects[97].notificationErrors([]);
                                    gPopupMetaData.data[15].tabsObjects[97].notificationErrors.push(new Msgerror(data.statusText, "error"));
                                    gPopupMetaData.data[15].tabsObjects[97].slideToggle();
                                }
                            });
                            return;
                        }
                    }
                    else if (gPopupMetaData.data[51].ExtraData[0].data.ssisPackageWorkflowData.hasOwnProperty(item.workflow_ID) &&
                            gPopupMetaData.data[51].ExtraData[0].data.ssisPackageWorkflowData[item.workflow_ID]) {
                            // SSIS Packages WITH parameters                        
                            taskProcessWorkFlow(96);
                            gPopupMetaData.data[96].ExtraData = [];
                            gPopupMetaData.data[96].ExtraData.push({ process_Workflow_ID: item.workflow_ID, tabsConfig: item.workflowSteps });
                            $('#gProcessWorkFlow').modal({ "show": true, "backdrop": "static", "keyboard": false });
                    }
                }
            }
        };
        this.getPanelsByTabId = (item) => {
            if (!gPopupMetaData.data[51].ExtraData[0]) {
                return;
            }
            this.columnsArray([]);
            let columArray = [];
            let processCategories = [];
            tabId = item.process_Tab_ID;
            if (gPopupMetaData.data[51].ExtraData[0].data.processTabs.find(x => x.process_Tab_ID === tabId).processCategories) {
                for (let i of gPopupMetaData.data[51].ExtraData[0].data.processTabs.find(x => x.process_Tab_ID === tabId).processCategories) {
                    if (columArray.find(x => x.column === i.column)) {
                        columArray.find(x => x.column === i.column).processCategories.push({ processCategories: i });
                        continue;
                    } else {
                        let localClonedArray = [];
                        localClonedArray.push({ processCategories: i });
                        columArray.push({ column: i.column, processCategories: localClonedArray });
                    }
                }
                this.columnsArray(columArray);
            }
        }
        this.OriginationSearchResults = ko.observableArray();
        this.showExisting = ko.observable();
        
        this.OriginationSearchResultsEmpty = ko.computed(function () {
            if (this.OriginationSearchResults().length > 0) {
                return false;
            }
            return true;
        }, this);
        this.addNewBatch = () => {
            taskBatchTransactions(55);
            taskNotification(55);
            $('#gBatchTransaction').modal({ "show": true, "backdrop": "static", "keyboard": false });
        }
        this.addNewDisbursement = () => {
            taskNewDisbursement(93);
            taskNotification(93);
            $('#newDisbursement').modal({ "show": true, "backdrop": "static", "keyboard": false });
        }
        this.importTransactions = () => {
            taskImportBatchTransactions(56);
            taskNotification(56);
            $('#gImportBatchTransaction').modal({ "show": true, "backdrop": "static", "keyboard": false });
        }
        this.transactionsApproval = () => {
            taskBatchTransactionApproval(58);
            $('#gBatchTransactionApproval').modal({ "show": true, "backdrop": "static", "keyboard": false });
        }

        this.Close = () => {
            $("#new-process-popup").modal("hide");
            $(".modal-backdrop").remove();
            tabNewProcesses(50, 0); //Re-initialization causes reset.
            //tabNewProcesses(50, 0); //Re-initialization causes reset.
            $("#new-process-popup").on('hidden.bs.modal', function () {
                for (var i = 0; i < gPopupMetaData.data[ID].tabsObjects.length; i++) {
                    if (gPopupMetaData.data[ID].tabsObjects[i]) {
                        gPopupMetaData.data[ID].tabsObjects[i].DisplayBlock(false);
                    }
                }
                if (gPopupMetaData.data[ID].tabsObjects[ID]) {
                    gPopupMetaData.data[ID].tabsObjects[ID].DisplayBlock(true);
                }
            });
        };

        this.SaveAndClose = async () => {
            let result = await _groupDocumentIndexing.uploadDocuments();
            let data = JSON.parse(result);
            let success = data.Succeeded;
            if (success) {
                tabNewProcesses(50, 0); //Re-initialization causes reset.
                self.Close()
            } else {
                //alert(data.ErrorMessage);
                gPopupMetaData.data[15].tabsObjects[ID].notificationErrors([]);
                gPopupMetaData.data[15].tabsObjects[ID].notificationErrors.push(new Msgerror(data.ErrorMessage, 'error'));
            }
        }

        this.IndexDocuments = () => {
            taskNotification(ID); 
            $('#new-process-popup').modal({ "show": true, "backdrop": "static", "keyboard": false });
        };

        this.ShowSearchResults = function () {
            var self = this;
            self.OriginationSearchResults.removeAll();
            //taskNotification(50);
            var activeTabId = GetActiveTab1("Panel-Existing");
            var searchType = activeTabId == "tabExistSACitizen" ? "SACitizen" : "ForeignCitizen";

            var form = $("form[name='" + activeTabId + "']");
            AddValidationRules(form, activeTabId);
            if (!form.valid()) {
                gPopupMetaData.data[15].tabsObjects[ID].notificationErrors.push(new Msgerror('Form invalid.', 'error'));
                return;
            }

            var SearchObject = {
                IDNumber: self.ExistingIDNo_Passport(),
                FirstName: self.ExistingFirstName(),
                LastName: self.ExistingLastName(),
                MemberNumber: self.ExistingMemberNo(),
                SearchType: searchType
            };

            $.getJSON(developmentUrlPrefix.concat('api/Searchlookup/Search?SearchResult=' + JSON.stringify(SearchObject) + '&SearchGroupName=SoftCollections'))
                .done(function (data) {
                    if (data.status === '200') {
                        var json = JSON.parse(data.data);

                        for (var j = 0; j < json.data.length; j++) {
                            self.OriginationSearchResults.push(new SearchResults(self, json.data[j].First_Name, json.data[j].Main_Name, json.data[j].Entity_ID_Number, json.data[j].App_ID, json.data[j].Contract_No, json.data[j].Entity_ID, json.data[j].Group_Id, json.data[j].Member_No));
                        }
                    }
                    self.showExisting(true);
                })
                .fail(function (jqxhr) {
                    gPopupMetaData.data[15].tabsObjects[ID].notificationErrors.push(new Msgerror('An error has occurred...Please contact the Administrator.', 'error'));
                });
        };

        function AddValidationRules(form, elementId) {
            switch (elementId) {
                case "tabExistSACitizen":
                    form.validate({
                        errorElement: "li",
                        errorPlacement: function (error, element) {
                            for (var i = 0; i < error.length; i++) {
                                var results = error[i].outerHTML;
                                gPopupMetaData.data[15].tabsObjects[ID].notificationErrors.push(new Msgerror(error[i].innerText, 'error'));
                            }
                        },
                        rules: {
                            biIdNumber: "required"
                        },
                        messages: {
                            biIdNumber: {
                                required: "ID number is required"
                            }
                        }
                    });
                    break;
                case "tabExistForeignCitizen":
                    form.validate({
                        errorElement: "li",
                        errorPlacement: function (error, element) {
                            for (var i = 0; i < error.length; i++) {
                                var results = error[i].outerHTML;
                                gPopupMetaData.data[15].tabsObjects[ID].notificationErrors.push(new Msgerror(error[i].innerText, 'error'));
                            }
                        },
                        rules: {
                            biPassport: "required"
                        },
                        messages: {
                            biPassport: {
                                required: "Passport is required"
                            }
                        }
                    });
                    break;
            }
        };
        
        this.bindMainNavTabs = () => {
            populateVariables(self);
            taskNotification(97);
        };
    }

    function SearchResults(object, Firstname, LastName, IDPassport, App_ID, Contract_No, Entity_ID, Group_Id, Member_No) {
        this.SearchResultFirstname = ko.observable(Firstname);
        this.SearchResultLastName = ko.observable(LastName);
        this.SearchResultIDPassport = ko.observable(IDPassport);
        this.SearchResultApp_ID = ko.observable(App_ID);
        this.SearchResultContract_No = ko.observable(Contract_No);
        this.SearchResultEntity_ID = ko.observable(Entity_ID);
        this.SearchResultGroup_Id = ko.observable(Group_Id);
        this.SearchResultMember_No = ko.observable(Member_No);

        //this.SelectedRowData = function () {
        //    var Parent = gPopupMetaData.data[ID].object;

        //    gPopupMetaData.data[ID].object.setSelectedEntity(this, gPopupMetaData.data[ID].object);
        //};

        this.SelectedRowData = function () {
            gPopupMetaData.data[ID].EntityID = this.SearchResultEntity_ID();
            gPopupMetaData.data[ID].ContractID = this.SearchResultContract_No();
            gPopupMetaData.data[ID].AppID = this.SearchResultApp_ID();
            //console.log(gPopupMetaData.data[ID]);
            //gPopupMetaData.data[ID].object.headerText(gPopupMetaData.data[ID].object.headerText() + " - " + this.SearchResultFirstname() + ' ' + this.SearchResultLastName() + ' ID ' + this.SearchResultIDPassport());
            //gPopupMetaData.data[ID].object.nextStep();
            document.getElementById('tab' + "IndexDocumentsView").click();

            _groupDocumentIndexing = {
                appID: gPopupMetaData.data[ID].AppID,
                entityID: gPopupMetaData.data[ID].EntityID,
                contractNo: gPopupMetaData.data[ID].ContractID,
                title: "Upload documents",
                documentGroup: null
            };
            GroupDocumentIndexing(_groupDocumentIndexing);
        };

        this.changeColor = function (data, event) {
            $('.search-OriginationSearchResultTableBodyRow').removeClass('active');
            $(event.currentTarget).addClass('active');
        };
    }

    var populateVariables = (object) => {
        //SearchGroupDocumentIndexing("new-processes-documents-indexdocuments"); //Defined in core.js
        
    };
    var populateVariables = (object) => {

        //SearchGroupDocumentIndexing("new-processes-documents-indexdocuments"); //Defined in core.js
        let columArray = [];
        let processCategories = [];
        GetJSONDATA({
            URL: developmentServiceUrl.concat('processmanagerservice/api/process/GetProcessTabs/processes'),
            CALLBACK: (data) => {
                if (data.succeeded) {
                    if (data.statusCode === 200) {
                        gPopupMetaData.data[51].ExtraData = [];
                        gPopupMetaData.data[51].ExtraData.push({ data: data.result });
                        object.tabs([]);

                        data.result.processTabs.forEach((item, index) => {
                            item.active = "";
                            if (index === 0) {
                                item.active = "active";
                            }
                            object.tabs.push(item);
                            object.getPanelsByTabId(item);
                            // let grantAccess = configMenuAcess(item);
                            // if (grantAccess) {
                            //     object.tabs.push(item);
                            //     object.getPanelsByTabId(item);
                            // }
                        });
                    }
                    else {
                        console.log('error');
                    }
                } else {
                    console.log('error');
                }
            }
        });
    };

    var populatePopupTemplate = () => {
        ko.cleanNode($('#tab-new-processes')[0]);
        ko.applyBindings(tabNewProcessesViewModel, $('#tab-new-processes')[0]);
    };

    var tabNewProcessesViewModel = new ViewModel();

    var init = () => {
        if (ko.components.isRegistered('tab-new-processes')) {
            ko.components.unregister('tab-new-processes');
            while (('tab-new-processes').firstChild) {
                ('tab-new-processes').removeChild(element.firstChild);
            }
        }

        ko.components.register('tab-new-processes', {
            viewModel: {
                instance: tabNewProcessesViewModel
            },
            template: {
                require: 'text!' + ComponentsPath + '/tab-new-processes/tab-new-processes.html'
            }
        });
        
        populatePopupTemplate();
    };

    return init();
};