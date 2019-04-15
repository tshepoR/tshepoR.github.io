


var taskProcessWorkFlow = (ID) => {

    require(['text!' + ComponentsPath + 'task/task-process-work-flow/task-process-work-flow.html']);
    require(['css!' + cssloadpath + 'task/task-process-work-flow/task-process-work-flow.css']);


    function ViewModel() {
        gPopupMetaData.data[96].object = this;
        gPopupMetaData.data[96].AppID = gPopupMetaData.data[ID].AppID;
        gPopupMetaData.data[96].EntityID = gPopupMetaData.data[ID].EntityID;
        gPopupMetaData.data[96].TargetID = gPopupMetaData.data[ID].TargetID;
        gPopupMetaData.data[96].ContractID = gPopupMetaData.data[ID].ContractID;
        gPopupMetaData.data[96].CallID = gPopupMetaData.data[ID].CallID;
        gPopupMetaData.data[96].ExtraData = gPopupMetaData.data[ID].ExtraData;
        gPopupMetaData.data[96].ProductCategoryDescription = gPopupMetaData.data[ID].ProductCategoryDescription;
        gPopupMetaData.data[96].ProductCategoryID = gPopupMetaData.data[ID].ProductCategoryID;
        this.workFlowSteps = ko.observableArray();
        //this.showUploadFileBtn = ko.observable(true);
        this.showUploadFileBtn = ko.observable(false);
        //this.showProcessBtn = ko.observable(false);
        this.showProcessBtn = ko.observable(true);
        this.tabsConfig = ko.observableArray([]);
        this.Close = () => {
            $("#gProcessWorkFlow").modal("hide");
            $("#gProcessWorkFlow").on('hidden.bs.modal', function () {
                for (var i = 0; i < gPopupMetaData.data[15].tabsObjects.length; i++) {
                    if (gPopupMetaData.data[15].tabsObjects[i]) {
                        gPopupMetaData.data[15].tabsObjects[i].DisplayBlock(false);
                    }
                }
                if (gPopupMetaData.data[15].tabsObjects[ID]) {
                    gPopupMetaData.data[15].tabsObjects[ID].DisplayBlock(true);
                }
            });
            if ($(".modal-backdrop")) {
                $(".modal-backdrop").remove();
            }
        };
        this.showNextTab = () => {
            setTimeout(function () {
                tabProcessFilesWorkFlow(96, 1);
                $('#paramsWorkFlow').hide();
                $('#processFilesWorkFlow').show();
                $("#tab0").removeClass("active");
                $("#tab1").addClass("active");
            }, 000);
        }
        this.processWorkFlowData = () => {
            this.ProcessSecuritizationBlockImportFile1();
               return;
            gPopupMetaData.data[15].tabsObjects[96].notificationErrors([]);
            switch (gPopupMetaData.data[ID].tabsObjects[0].object.processWorkFlow()[0].workflow_Name) {
                case "Iemas_Torque_Securitisation_Data_Import.dtsx":
                    this.ProcessSecuritizationBlockImportFile();
                    break;
                default:
                    let data = [];
                    for (let i of gPopupMetaData.data[ID].tabsObjects[0].object.processWorkFlow()[0].ssisPackageParameters) {

                        if (!i.ssiS_Param_value && i.input_Type !== 'UPLOAD') {
                            gPopupMetaData.data[15].tabsObjects[96].notificationErrors.push(new Msgerror("Please enter parameter values", 'error'));
                            return;
                        }
                        data.push({ ssiS_Param_Id: i.ssiS_Param_Id, ssiS_Param_value: i.ssiS_Param_value });
                    }
                    PostJSONDATA({
                        URL: developmentServiceUrl.concat('processmanagerservice/api/SSISPackage/ExecuteSSISPackage'),
                        DATA: JSON.stringify({ ssis_Id: gPopupMetaData.data[ID].tabsObjects[0].object.processWorkFlow()[0].ssiS_Id, userId: getCookie("username"), SSISPopulatedPackageParameters: data }),
                        CALLBACK: (data) => {
                            if (data.succeeded) {
                                if (data.statusCode === 200) {
                                    if (isNaN(data.result)) {
                                        Notification.Error(ID, 'An error has occurred...Please contact the Administrator.');
                                    } else {
                                        gPopupMetaData.data[15].tabsObjects[96].notificationErrors.push(new Msgerror('Succeeded', 'msg'));
                                    }
                                    //debugger
                                    //this.showNextTab();
                                }
                                else {
                                    //Notification.Error(ID, data.data);
                                    gPopupMetaData.data[15].tabsObjects[96].notificationErrors.push(new Msgerror(data.errorMessage, 'error'));
                                }
                            } else {
                                Notification.Error(ID, 'An error has occurred...Please contact the Administrator.');
                            }
                        }
                    });

                    break;
            }
        }
        this.ProcessSecuritizationBlockImportFile1 = () => {
            if (!gPopupMetaData.data[56].tabsObjects[1].object.fileData()[0]) {
                gPopupMetaData.data[15].tabsObjects[96].notificationErrors.push(new Msgerror("Please select a file to import", 'error'));
                return;
            }
          var data =[];
         if(gPopupMetaData.data[56].tabsObjects[1].object.csv().length>0){
         let approved=null;
         gPopupMetaData.data[56].tabsObjects[1].object.csv().forEach((i,index)=>{

             if(index>0){

                if(i!==""){
                if(i[0].split(",")[5]==""){
                   approved =false
                 }else{
                  if(i[0].split(",")[5]==="1"){
                      approved=true;
                   }else{
                     approved=false;
                  }
                 }
                data.push({
                exra_Date:i[0].split(",")[0],
                member_No:i[0].split(",")[1],
                acc_Code:i[0].split(",")[2],
                contract_No:i[0].split(",")[3],
                current_Balance:i[0].split(",")[4],
                Approved:approved
                 });}
          }
     });
}
         
     PostJSONDATA({
                URL:evelopmentServiceUrl.concat("processmanagerservice/api/process/ImportCsvTourqueData"),
                DATA:JSON.stringify(data),
                CALLBACK: (data) => {

                    if (data.succeeded) {
                         
                        if (data.statusCode === 200) {
                        
                        this.ProcessTorqueSecuritizationBlockImportFile();
                        }
                        else {
                            Notification.Error(ID, data.data);
                        }
                    } else {
                        Notification.Error(ID, 'An error has occurred...Please contact the Administrator.');
                    }
                }
            });
        
           
        }
        this.ProcessSecuritizationBlockImportFile = () => {
            if (!gPopupMetaData.data[56].tabsObjects[1].object.fileData()[0]) {
                gPopupMetaData.data[15].tabsObjects[96].notificationErrors.push(new Msgerror("Please select a file to import", 'error'));
                return;
            }

            var data = new FormData();
            data.append('File', gPopupMetaData.data[56].tabsObjects[1].object.fileData()[0]);
            data.append("Workflow_ID", gPopupMetaData.data[ID].tabsObjects[0].object.processWorkFlow()[0].workflow_ID);
            data.append("Document_Type_Name", "SecuritizationImportData");
            $.ajax({
                type: 'POST',
                url: developmentServiceUrl.concat('processmanagerservice/api/SSISPackage/ProcessSecuritizationBlockImportFile'),
                headers: {
                    "Username": getCookie("username")
                },
                data: data,
                contentType: false,
                processData: false,
                success: function (data) {
                    if (!data.succeeded) {
                        gPopupMetaData.data[15].tabsObjects[96].notificationErrors.push(new Msgerror("Import file failed, please try again", 'error'));
                        return;
                    }
                    //$('#task-bacth-transaction').unblock();
                    gPopupMetaData.data[15].tabsObjects[96].notificationErrors.push(new Msgerror(data.result, 'success'));
                    gPopupMetaData.data[15].tabsObjects[96].slideToggle();
                    //setTimeout(() => gPopupMetaData.data[ID].object.Close(), 3000);
                    gPopupMetaData.data[96].object.showNextTab();
                    
                },
                error: function (err) {
                    //$('#task-bacth-transaction').unblock();
                    //unexpectedError('An error has occurred...Please contact the Administrator.');
                    Notification.Error(ID, JSON.parse(err.responseText).errorMessage);
                }
            });
        }
        this.ProcessTorqueSecuritizationBlockImportFile = () => {
            var data ={ SSIS_Id:7,
                      ssiS_Param_value:'',
                      userID:getCookie("username"),
                      sSISPopulatedPackageParameters:[],
                      sSISPopulatedPackageParameters:[],
                      sSISPopulatedPackageParameters:[],
                      workflow_ID:gPopupMetaData.data[ID].tabsObjects[0].object.processWorkFlow()[0].workflow_ID };
                 PostJSONDATA({
                 URL:developmentServiceUrl.concat("processmanagerservice/api/SSISPackage/ExecuteTorqueSecuritisationDataImportSSISPackageAsync"),
                 DATA:JSON.stringify(data),
                 CALLBACK: (data) => {
                    if (data.succeeded) {
                        if (data.statusCode === 200) {
                           gPopupMetaData.data[15].tabsObjects[96].notificationErrors.push(new Msgerror(data.result, 'success'));
                           gPopupMetaData.data[15].tabsObjects[96].slideToggle(96);
                        }
                        else {
                            Notification.Error(ID, data.data);
                        }
                    } else {
                        Notification.Error(ID, 'An error has occurred...Please contact the Administrator.');
                    }
                }
            });
        }
        this.bindMainNavTabs = () => {
            this.configerTabs();
            taskNotification(96);
            setTimeout(function () {
                tabPrcoessWorkFlow(96, 0);
                $('#paramsWorkFlow').show();
               
            }, 000);
             taskImportBatchTransactions(56);
            $('#upload').modal({ "show": true, "backdrop": "static", "keyboard": false });
            tabUploadFile(56, 1);
        };
        //this.nextStep = () => {
        //    setTimeout(function () {
        //        tabProcessFilesWorkFlow(96, 1);
        //        $('#paramsWorkFlow').hide();
        //        $('#processFilesWorkFlow').show();
        //    }, 000);
            
        //}

        this.configerTabs = () => {
            if (gPopupMetaData.data[96].ExtraData.length > 0) {
                
                gPopupMetaData.data[96].ExtraData[0].tabsConfig.forEach((item, index) => {
                    item.id = "tab" + index;
                    this.tabsConfig.push(item);
                });
                $("#tab1").removeClass("active");
            }
        }
        this.processConfirmation = {
            Yes: () => {

            },
            No: () => {

            }
        }

        this.call = () => {
            //$('#process-confirmation').modal({ "show": true, "backdrop": "static", "keyboard": false });
        }
    }
    var populatePopupTemplate = () => {
        ko.cleanNode($('#task-process-work-flow')[0]);
        ko.applyBindings(tabNewProcessesViewModel, $('#task-process-work-flow')[0]);
    };

    var tabNewProcessesViewModel = new ViewModel();

    var init = () => {
        if (ko.components.isRegistered('task-process-work-flow')) {
            ko.components.unregister('task-process-work-flow');
            while (('task-process-work-flow').firstChild) {
                ('task-process-work-flow').removeChild(element.firstChild);
            }
        }

        ko.components.register('task-process-work-flow', {
            viewModel: {
                instance: tabNewProcessesViewModel
            },
            template: {
                require: 'text!' + ComponentsPath + 'task/task-process-work-flow/task-process-work-flow.html'
            }
        });
        
        populatePopupTemplate();
    };

    return init();

};