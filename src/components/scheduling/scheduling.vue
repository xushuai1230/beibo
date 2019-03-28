<template>
  <div class="conmmonlist menu">
    <div class="toolBar">
      <el-button class="bar" @click="dbImport()" size="mini" icon="el-icon-circle-plus-outline">导入</el-button>
      <el-button class="bar" @click="dbExport()" size="mini" icon="el-icon-circle-plus-outline">导出</el-button>
      <el-button class="bar" @click="save()" size="mini" icon="el-icon-circle-plus-outline">保存</el-button>
    </div>
    <div class="commonTable">
      <div class="listTable">
        <el-table
          class="newTable"
          v-loading="loading"
          @cell-dblclick="addType"
          :data="tableData"
          stripe
          border
          height="100%"
        >
          <el-table-column
            type="index"
            :index="indexMethod"
            label="序号"
            width="54"
            align="center"
            fixed
          ></el-table-column>
          <el-table-column prop="DisplayName" label="软件表格代码"></el-table-column>
          <el-table-column label="数据源类型" width="120">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.OutSource"
                @change="outsourcetype(scope )"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in scope.row.OutSourceEnumInfo"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="链接字符串/文件路径">
            <template slot-scope="scope">
              <!-- <el-form v-if="scope.row.OutSource == 0" :model="scope.row">
              <el-form-item prop="path">-->
              <el-input
                v-if="scope.row.OutSource == 0"
                class="file-ipt"
                @blur="connect(scope)"
                v-model="scope.row.ConnectionPath"
                placeholder
              />
              <!-- </el-form-item>
              </el-form>-->
              <!-- <el-select v-if="scope.row.OutSource == 1" v-model="serverValue" placeholder="请选择">
                  <el-option
                    v-for="item in serverData"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
              </el-select>-->
              <el-select
                v-if="scope.row.OutSource == 1"
                v-model="scope.row.ConnectionPath"
                filterable
                allow-create
                default-first-option
                placeholder="请选择"
                @change="dbChoose(scope.row)"
              >
                <el-option
                  v-for="item in scope.row.DBConnetionPathEnumInfo"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="用户表格名">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.UserTableName"
                filterable
                allow-create
                default-first-option
                placeholder="请选择"
                @change="tableChoose(scope.row)"
              >
                <el-option
                  v-for="(item,index) in scope.row.TableEnumInfo"
                  :key="index"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
              <!-- <el-form :model="scope.row">
                <el-form-item prop="path">
                  <el-input class="file-ipt" v-model="scope.row.UserTableName" placeholder/>
                </el-form-item>
              </el-form>-->
            </template>
          </el-table-column>

          <el-table-column label="字段对应设置">
            <template slot-scope="scope">
              <el-form :model="scope.row">
                <el-form-item prop="path">
                  <el-input class="file-ipt" v-model="scope.row.Mapping" placeholder/>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column label="导入方式">
            <template slot-scope="scope">
              <el-select v-model="scope.row.Import" placeholder="请选择">
                <el-option
                  v-for="item in scope.row.ImportEnumInfo"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="主键"></el-table-column>

          <el-table-column label="导出方式">
            <template slot-scope="scope">
              <el-select v-model="scope.row.Export" placeholder="请选择">
                <el-option
                  v-for="item in scope.row.ExportEnumInfo"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="导出筛选条件">
            <template slot-scope="scope">
              <el-form :model="scope.row">
                <el-form-item prop="path">
                  <el-input class="file-ipt" v-model="scope.row.Filter" placeholder/>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <importExportDialog
      :importDialogVisible="importDialogVisible"
      v-on:DialogVisibleFalse="importDialogClose"
      v-if="importDialogVisible"
      :tableData="dialogInterData"
    ></importExportDialog>
    <!-- <dbConfiguration
      :DBdialogVisible="DBdialogVisible"
      v-if="DBdialogVisible"
      v-on:DialogVisibleFalse="DBdialogClose"
    ></dbConfiguration>-->
    <cdtConfiguration
      :cdtdialogVisible="cdtdialogVisible"
      v-if="cdtdialogVisible"
      v-on:DialogVisibleFalse="cdtdialogClose"
      :tableData="dialogInterData"
    ></cdtConfiguration>
  </div>
</template>
<script>
import "../../assets/sass/menu.scss";
// import "./scheduling.scss";
import importExportDialog from "../common/dialog/importExport";
// import dbConfiguration from "../common/dialog/dbConfig";
import cdtConfiguration from "../common/dialog/cdtConfig";
import { mapGetters } from "vuex";
import importlistVue from "../common/normal/importlist.vue";
import qs from "qs";
export default {
  data() {
    return {
      tableData: [],
      configData: "",
      value: "",
      input: "",
      inputType: "text",
      // serverData: [], //数据库下拉框
      serverValue: "",
      tableNameData: [],
      dialogInterData: "",
      fileValue: "",
      rowValve: "",
      loading: false, //loading
      importDialogVisible: false, // 导入导出弹窗
      // DBdialogVisible: false, //DB配置弹窗
      cdtdialogVisible: false //条件配置弹窗
    };
  },
  computed: {
    ...mapGetters(["token"]) // 获取vuex的token
  },
  created() {},
  mounted() {
    this.getTableJsonData();
  },
  components: {
    importExportDialog,
    // dbConfiguration,
    cdtConfiguration
  },
  methods: {
    indexMethod(index) {
      return index;
    },
    importDialogClose(val) {
      this.importDialogVisible = val;
    },
    // DBdialogClose(val) {
    //   this.DBdialogVisible = val;
    // },
    cdtdialogClose(val) {
      this.cdtdialogVisible = val;
    },

    addType(row,column,cell, event) {
      console.log(row,column,cell, event );
      if (column.label == "字段对应设置") {
        if (row.ConnectionPath == "" || row.UserTableName == "") {
          // console.log("选择文件");
          this.$message({
            type:'warning',
            message:'请选择此行其他选项 '
          })
        } else {
          this.importDialogVisible = true;
          this.dialogInterData = row;
        }
      } else if (column.label == "导出筛选条件") {
        this.cdtdialogVisible = true;
        this.dialogInterData = row;
      }
    },
    connect(val) {
      this.dbChoose(val.row);
    },
    dbChoose(val) {
      console.log(val);
      // if(val.ConnectionPath == '') {
      //   this.$message({
      //     type:'warning',
      //     message:'请选择此行其他选项'
      //   })
      // }
      if (val.OutSource == 0) {
        var dbtableParams = JSON.stringify({
          Name: "CSV",
          DefaultVal: "DataTable",
          Filter: val.ConnectionPath
        });
      } else {
        var dbtableParams = JSON.stringify({
          Name: "DB",
          DefaultVal: "DataTable",
          Filter: val.ConnectionPath
        });
      }

      this.$http
        .post(
          Yukon.Action.GetJsonData,
          JSON.stringify({
            token: this.token,
            reqInfo: dbtableParams
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(res => {
          var result = JSON.parse(res.body);
          if (result.code == 0) {
            if (result.data.length > 0) {
              val.TableEnumInfo = result.data;
              val.UserTableName = val.TableEnumInfo[0];
              console.log(val,val.TableEnumInfo[0]);
            } else {
              val.UserTableName = "";
            }
          } else {
            val.TableEnumInfo = "";
            val.UserTableName = "";
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    tableChoose(val) {
      console.log(val);
    },
    outsourcetype(val) {
      if (val.row.OutSource == 1) {
        this.getDbTable(val.row);
      }else {
        val.row.ConnectionPath = ''
      }
    },

    getDbTable(val) {
      var dbTableData = JSON.stringify({ Name: "DB", DefaultVal: "DBList" });
      this.$http
        .post(
          Yukon.Action.GetJsonData,
          JSON.stringify({
            token: this.token,
            reqInfo: dbTableData
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(res => {
          var result = JSON.parse(res.body);
          console.log("6666666", result);
          if (result.code == 0) {
            val.DBConnetionPathEnumInfo = result.data;
          }
          console.log(this.tableData);
        })
        .catch(err => {});
    },
    getTableJsonData() {
      this.loading = true;
      this.$http
        .post(
          Yukon.Action.GetJsonData,
          JSON.stringify({
            token: this.token,
            reqInfo: '{"Name":"service","Filter":"APS"}'
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(response => {
          this.loading = false;
          var result = JSON.parse(response.body);
          console.log(result);
          if (result.code == 0) {
            this.configData = result.data;
            this.tableData = result.data.Tables;
           
            for (var i = 0; i < this.tableData.length; i++) {
              if (this.tableData[i].OutSource == 0) {
                this.tableData[i].TableEnumInfo = [];
              } else {
                  this.UserTableName = this.tableData[i].TableEnumInfo[0];
              }
            }
          } else {
          }
        })
        .catch(err => {
          this.loading = false;
          console.log(err);
        });
    },
    // 保存配置
    // Yukon.Action.SetJsonData
    save() {
      var saveParams = JSON.stringify({
        Name: "save",
        PropertyValueMap: this.configData
      });
      this.$http
        .post(
          Yukon.Action.SetJsonData,
          JSON.stringify({
            token: this.token,
            data: saveParams
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(res => {
          var result = JSON.parse(res.data);
          if (result.code == "0") {
            this.$message({
              type: "success",
              message: "保存成功"
            });
          } else if (result.code == "-1") {
            this.$message({
              type: "error",
              message: "保存失败"
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //导入
    dbImport() {
      this.$http
        .post(
          Yukon.Action.Import,
          JSON.stringify({
            token: this.token
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(res => {
          var result = JSON.parse(res.data);
          if (result.code == "0") {
            this.$message({
              type: "success",
              message: "导入成功"
            });
          } else if (result.code == "-1") {
            this.$message({
              type: "error",
              message: "导入失败"
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 导出
    dbExport() {
      this.$http
        .post(
          Yukon.Action.Export,
          JSON.stringify({
            token: this.token
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(res => {
          console.log(res);
          var result = JSON.parse(res.data);
          if (result.code == "0") {
            this.$message({
              type: "success",
              message: "导出成功"
            });
          } else if (result.code == "-1") {
            this.$message({
              type: "error",
              message: "导出失败"
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>
 <style lang="scss" scoped>
body {
  /deep/ .el-popper[x-placement^="bottom"] {
    margin: 0;
  }
}
</style>