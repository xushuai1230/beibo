<template>
  <el-dialog
    class="importDialog cover_dialog"
    title="导入导出字段设置"
    :visible.sync="dialogVisible"
    :before-close="btnCancel"
  >
    <div class="importContent">
      <div class="dialogTop">
        <ul class="importIpt">
          <li>
            <span>内部字段</span>
            <el-select v-model="internalValue" placeholder="请选择">
              <el-option
                v-for="(item,index) in tableData.Columns"
                :key="index"
                :label="item.DisplayName"
                :value="item.ColumnName"
              ></el-option>
            </el-select>
          </li>
          <li>
            <span>外部字段</span>
            <el-select v-model="externalValue" placeholder="请选择">
              <el-option v-for="(item,index) in options" :key="index" :label="item" :value="item"></el-option>
            </el-select>
          </li>
        </ul>
        <div class="importBtn">
          <el-row>
            <el-button type="primary" @click="allImport">全映射</el-button>
            <el-button @click="addImport" type="primary">添加</el-button>
          </el-row>
        </div>
      </div>
      <div class="dialogTable">
        <el-table :data="importtableData" stripe border style="width: 100%">
          <el-table-column prop="interField" label="内部字段"></el-table-column>
          <el-table-column prop="exterField" label="外部字段"></el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope)" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="btnCancel">取 消</el-button>
      <el-button type="primary" size="small" @click="btnSure">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["importDialogVisible", "tableData"],
  data() {
    return {
      dialogVisible: this.importDialogVisible,
      importtableData: [],
      tempArr: [],
      options: [],
      externalValue: "",
      internalName: "",
      internalValue: ""
    };
  },
  computed: {
    ...mapGetters(["token"]) // 获取vuex的token
  },
  watch: {},
  mounted() {
    this.extField();
  },
  methods: {
    handleClick(row) {
      this.importtableData.splice(row.$index, 1);
      console.log(row.$index, this.importtableData);
    },
    btnCancel() {
      this.dialogVisible = false;
      this.$emit("DialogVisibleFalse", false);
    },
    btnSure() {
      this.tableData.MapEnumInfo = this.importtableData;
      console.log(this.importtableData);
      var tableLength = this.importtableData.length;
      for (var j = 0; j < tableLength; j++) {
        var dataLength = this.tableData.Columns.length;
        for (var i = 0; i < dataLength; i++) {
          if (
            this.tableData.Columns[i].DisplayName ==
            this.importtableData[j].interField
          ) {
            this.importtableData[j].interField = this.tableData.Columns[
              i
            ].ColumnName;
          }
        }
      }
      this.tableData.Mapping = "";
      for (var k = 0; k < this.importtableData.length; k++) {
        this.tableData.Mapping +=
          this.importtableData[k].interField +
          ":" +
          this.importtableData[k].exterField +
          ";";
      }
      this.dialogVisible = false;
      this.$emit("DialogVisibleFalse", false);
    },
    allImport() {
      this.importtableData = [];
      var tableLength = this.tableData.Columns.length;
      var extabelLength = this.tableData.TableEnumInfo.length;
      for (var k = 0; k < tableLength; k++) {
        for (var j = 0; j < extabelLength; j++) {
          this.importtableData.push({
            interField: this.tableData.Columns[k].ColumnName,
            exterField: this.tableData.TableEnumInfo[j]
          });
        }
      }
      console.log(this.importtableData);
    },
    addImport() {
      var temp = {
        interField: this.internalValue, //内部字段
        exterField: this.externalValue //外部字段
      };
      var tableLength = this.tableData.Columns.length;
      for (var i = 0; i < tableLength; i++) {
        if (this.tableData.Columns[i].ColumnName == temp.interField) {
          temp.interField = this.tableData.Columns[i].DisplayName;
        }
      }
      if (this.tempArr.indexOf(JSON.stringify(temp)) == -1) {
        this.tempArr.push(JSON.stringify(temp));
        for (var i = 0; i < this.tempArr.length; i++) {
          this.importtableData.push(JSON.parse(this.tempArr[i]));
        }
      } else {
        this.$message({
          type: "warning",
          message: "已有此项内容"
        });
      }
      console.log(this.importtableData);
    },
    extField() {
      if (this.tableData.MapEnumInfo.length > 0) {
        this.importtableData = this.tableData.MapEnumInfo;
        for (var k = 0; k < this.importtableData.length; k++) {
          var tableLength = this.tableData.Columns.length;
          for (var i = 0; i < tableLength; i++) {
            if (
              this.tableData.Columns[i].ColumnName ==
              this.importtableData[k].interField
            ) {
              this.importtableData[k].interField = this.tableData.Columns[
                i
              ].DisplayName;
            }
          }
        }
      } else {
        this.importtableData = [];
      }
      if (this.tableData.OutSource == 1) {
        var filterData = JSON.stringify({
          ConnectionPath: this.tableData.ConnectionPath,
          TableName: this.tableData.UserTableName
        });
        var extparams = JSON.stringify({
          Name: "DB",
          DefaultVal: "DataColumn",
          Filter: filterData
        });
      } else {
        var extparams = JSON.stringify({
          Name: "CSV",
          DefaultVal: "DataColumn",
          Filter: JSON.stringify({
            ConnectionPath: this.tableData.ConnectionPath,
            OuterTableName: this.tableData.UserTableName,
            InnerTableName: this.tableData.Id,
            ServiceName: "Demand"
          })
        });
      }
      this.$http
        .post(
          Yukon.Action.GetJsonData,
          JSON.stringify({
            token: this.token,
            reqInfo: extparams
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
            this.options = result.data;
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<style lang="less" scoped>
.importDialog {
  /deep/ .el-dialog {
    .el-table__empty-block {
      min-height: 30px;
    }
    .el-table__body-wrapper {
      max-height: 400px;
      overflow-y: auto;
    }
  }
  .dialogTop > ul {
    float: left;
    width: 54%;
  }
  .dialogTop > div {
    float: left;
  }
  .importIpt > li {
    width: 100%;
  }
  .importIpt > li > span {
    min-width: 69px;
    height: 28px;
    float: left;
    line-height: 26px;
    border-radius: 3px 0 0 3px;
    margin-bottom: 8px;
    padding-left: 10px;
    border: 1px solid #dcdfe6;
    border-right: none;
    font-size: 12px;
    white-space: nowrap;
  }
  .importIpt > li > .el-select {
    width: calc(100% - 69px);
    height: 28px;
    float: left;
    border-radius: 0 3px 3px 0;
    margin-bottom: 8px;
    border: 1px solid #dcdfe6;
    font-size: 12px;
  }
  .importBtn {
    margin-left: 10%;
    margin-top: 15px;
  }
  .importBtn > .el-row {
    border: none;
  }
  .importBtn > .el-row > .el-button {
    padding: 7px 15px;
    font-size: 12px;
    border-radius: 3px;
    cursor: pointer;
    float: left;
  }
}
</style>
